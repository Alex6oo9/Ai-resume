# Cover Letter Generator — Complete Feature Documentation

> Current as of codebase state: March 2026. Documents the v3 architecture (multiple letters per resume, TipTap editor, improve endpoint, upload mode).

---

## 1. Feature Overview

### Business Purpose
Users generate ATS-optimized cover letters from their existing resumes or an uploaded PDF + a pasted job description. The AI extracts keyword matches first, then writes the letter. Users can edit with a rich-text editor, improve with personalizations, regenerate, revert to AI original, and download as PDF or TXT.

### Two Resume Input Modes
| Mode | How | Behaviour |
|------|-----|-----------|
| **Existing Resume** | Dropdown select | Picks from user's saved resumes (Path A or B) |
| **Upload PDF** | Drag-drop or file input | Uploads PDF via `/upload-simple`, lazy text extraction on first AI call |

### Three Entry Points (URL)
| URL | Behaviour |
|-----|-----------|
| `/cover-letter/new` | Fresh page — shows resume-selection step |
| `/cover-letter/new?id=<letter_id>` | Deep-link to edit existing letter directly (skips selection step) |
| `/cover-letter/new?resume_id=<resume_id>` | Pre-selects a resume, jumps to editor, opens resume preview panel |

### User Flow (happy path)
1. Select resume (or upload PDF) → click **Continue**
2. Fill job description + company + optional fields → click **Generate Cover Letter**
3. Frontend calls `POST /api/cover-letter/extract-keywords` (Step 1: scanning)
4. Keywords displayed as badge preview (Step 2: 1.2s pause)
5. Frontend calls `POST /api/cover-letter/generate` with keywords (Step 3: writing)
6. Letter appears in TipTap rich-text editor
7. User edits inline → clicks **Save Changes**
8. Optional: **Improve** (weave in personalizations), **Regenerate**, **Export**

### Key Business Rules
- **Multiple letters per resume** — no UNIQUE constraint; each generate creates a new row
- **Revert to AI original** — `generated_content` never overwritten on save; `content` is the mutable copy
- **Keyword coverage badges** — live, computed client-side as user types
- **Upload mode auto-saves** — uploading a PDF creates a new resume record; text is extracted lazily on first AI call
- **Improve** — AI personalizes a letter by weaving in whyThisCompany + achievementToHighlight
- **Regenerate** — only available for DB-saved resumes (not standalone uploaded PDFs)
- **Job description** capped at 5000 characters (frontend maxLength + backend validator)
- **Custom instructions** capped at 500 characters

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| AI model | GPT-4o-mini (OpenAI) |
| Keyword extraction | temp 0.3, `response_format: { type: 'json_object' }` |
| Letter generation | temp 0.8, plain text output |
| Improve | temp 0.7, plain text output |
| Backend | Node.js + Express 4 + TypeScript |
| Database | PostgreSQL — raw `pg` pool, UUID PKs |
| Auth | Passport.js session, `isAuthenticated` middleware |
| Validation | express-validator (`body()` chain) |
| Rate limiting | `aiLimiter` (10 req / 15 min per IP) |
| Frontend | React 18 + TypeScript + TailwindCSS + Vite |
| Rich-text editor | TipTap v2 (StarterKit extension) |
| HTTP client | axios (baseURL `/api`, `withCredentials: true`) |
| PDF export | Puppeteer via `POST /api/export/pdf-from-html` |
| File storage | Cloudinary (uploaded PDFs via `/upload-simple`) |

---

## 3. Database Schema

### Migrations

| Migration | Changes |
|-----------|---------|
| `022_create_cover_letters` | Creates table: id, resume_id NOT NULL (UNIQUE), user_id, content, generated_content, tone, word_count_target, company_name, hiring_manager_name, custom_instructions, timestamps |
| `027_cover_letters_multiple` | Drops `UNIQUE(resume_id)`, adds `job_title VARCHAR(255)`, creates index `idx_cover_letters_resume_created (resume_id, created_at DESC)` |
| `028_cover_letters_nullable_resume` | Alters `resume_id` to allow NULL (supports letters from uploaded-only PDFs) |
| `030_cover_letters_add_job_description` | Adds `job_description TEXT DEFAULT NULL` |

### Current Table Schema

```sql
CREATE TABLE cover_letters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id             UUID REFERENCES resumes(id) ON DELETE CASCADE,   -- nullable
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content               TEXT NOT NULL,          -- mutable (user edits this)
  generated_content     TEXT NOT NULL,          -- frozen AI output (for revert)
  tone                  VARCHAR(50) NOT NULL DEFAULT 'professional',
  word_count_target     VARCHAR(20) NOT NULL DEFAULT 'medium',
  company_name          VARCHAR(255),
  hiring_manager_name   VARCHAR(255),
  job_title             VARCHAR(255),
  job_description       TEXT,
  custom_instructions   TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cover_letters_resume_created ON cover_letters(resume_id, created_at DESC);
CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
```

**Design decisions:**
- `resume_id` is nullable — letters created from uploaded PDFs that weren't saved to DB have no resume_id
- `ON DELETE CASCADE` — deleting a resume deletes all its cover letters
- `content` vs `generated_content` — user saves edits to `content`; `generated_content` is frozen at generation/regeneration/improve time and used for "Revert to AI original"

---

## 4. TypeScript Interfaces

### Frontend — `client/src/types/index.ts`

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';
export type ProgressStep = 'idle' | 'extracting' | 'keywords-ready' | 'generating' | 'done' | 'error';

export interface Keywords {
  matched: string[];
  missing: string[];
}

export interface CoverLetter {
  id: string;
  resume_id: string | null;
  user_id: string;
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  job_title: string | null;
  job_description: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateCoverLetterPayload {
  resumeId?: string;        // one of resumeId or resumeText required
  resumeText?: string;
  fullName: string;
  targetRole?: string;
  targetLocation?: string;
  jobDescription: string;   // required
  companyName: string;      // required
  hiringManagerName?: string;
  jobTitle?: string;
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  customInstructions?: string;
}
```

### Backend — `server/src/types/coverLetter.types.ts`

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';

export interface GenerateCoverLetterRequest {
  resumeId?: string;
  resumeText?: string;
  fullName: string;
  targetRole: string;
  targetLocation: string;
  jobDescription: string;
  companyName: string;
  hiringManagerName?: string;
  jobTitle?: string;
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  customInstructions?: string;
}

export interface ImproveRequest {
  whyThisCompany?: string;        // max 300 chars
  achievementToHighlight?: string; // max 200 chars
}

export interface CoverLetterRecord {
  id: string;
  resume_id: string | null;
  user_id: string;
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  job_title: string | null;
  job_description: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}
```

### Hook Interface — `client/src/hooks/useCoverLetters.ts`

```typescript
export type CoverLetterMode = 'new' | 'edit';
export type ResumeInputMode = 'existing' | 'upload';

export interface ExtractedContactInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface UseCoverLettersReturn {
  coverLetters: CoverLetter[];
  activeLetter: CoverLetter | null;
  mode: CoverLetterMode;
  keywords: Keywords;
  progressStep: ProgressStep;
  isLoading: boolean;
  isSaving: boolean;
  savedIndicator: boolean;
  error: string | null;
  resumeInputMode: ResumeInputMode;
  uploadedResumeText: string | null;
  uploadedFileName: string | null;
  uploadedResumeId: string | null;
  uploadedResumeFilePath: string | null;
  isParsing: boolean;
  parseError: string | null;
  extractedContactInfo: ExtractedContactInfo | null;
  startNew: () => void;
  selectLetter: (letter: CoverLetter) => void;
  loadLetter: (letterId: string) => Promise<void>;
  create: (payload: GenerateCoverLetterPayload) => Promise<{ resumeSaved?: boolean }>;
  regenerate: (letterId: string, payload: GenerateCoverLetterPayload) => Promise<void>;
  save: (content: string) => Promise<void>;
  remove: (letterId: string) => Promise<void>;
  reset: () => void;
  setResumeInputMode: (mode: ResumeInputMode) => void;
  parseUploadedFile: (file: File) => Promise<void>;
  improve: (letterId: string, whyThisCompany?: string, achievementToHighlight?: string) => Promise<void>;
}

export function useCoverLetters(resumeId: string | null): UseCoverLettersReturn
```

---

## 5. API Endpoints

All routes mounted at `/api/cover-letter`. All require `isAuthenticated` middleware.

### Route Table

| Method | Path | Rate Limited | Handler |
|--------|------|-------------|---------|
| `POST` | `/extract-keywords` | `aiLimiter` | `extractKeywords` |
| `GET` | `/` | — | `listCoverLetters` |
| `POST` | `/generate` | `aiLimiter` | `generateCoverLetter` |
| `GET` | `/resume/:resumeId` | — | `listCoverLettersByResume` |
| `GET` | `/:id` | — | `getCoverLetter` |
| `PUT` | `/:id` | — | `updateCoverLetter` |
| `DELETE` | `/:id` | — | `deleteCoverLetter` |
| `POST` | `/:id/regenerate` | `aiLimiter` | `regenerateCoverLetter` |
| `POST` | `/:id/improve` | `aiLimiter` | `improveCoverLetter` |

---

### `POST /api/cover-letter/extract-keywords`

**Request body:**
```json
{
  "resumeId": "uuid-v4",           // one of resumeId or resumeText required
  "resumeText": "string",
  "jobDescription": "string (1–5000 chars)"
}
```

**Validators:**
```typescript
oneOf([
  body('resumeId').exists().isUUID(),
  body('resumeText').exists().isString().notEmpty()
]),
body('jobDescription').exists().isString().notEmpty().isLength({ max: 5000 })
```

**Controller logic:**
1. If `resumeId`: query `resumes` + LEFT JOIN `resume_data`
2. **Lazy PDF extraction**: if no `parsed_text` but has `file_path` (Cloudinary URL) → fetch PDF via HTTPS, parse text, cache to `resumes.parsed_text`
3. Build `resumeText` via `getResumeText()` helper
4. Call `extractKeywordsService({ resumeText, jobDescription })`
5. Call `extractResumeStructure({ resumeText })` (best-effort, non-blocking) → stores to `resume_data`
6. Return `{ matchedKeywords[], missingKeywords[], contactInfo }`

**Response 200:**
```json
{
  "matchedKeywords": ["React", "TypeScript"],
  "missingKeywords": ["Docker", "CI/CD"],
  "contactInfo": { "fullName": "Jane Doe", "email": "jane@example.com", "phone": "+1234", "city": "London", "country": "UK" }
}
```

---

### `POST /api/cover-letter/generate`

**Request body:**
```json
{
  "resumeId": "uuid-v4",
  "fullName": "Jane Doe",
  "targetRole": "Software Engineer",
  "targetLocation": "London, UK",
  "jobDescription": "string (1–5000 chars)",
  "companyName": "Acme Corp",
  "hiringManagerName": "John Smith",
  "jobTitle": "Backend Engineer",
  "tone": "professional",
  "wordCountTarget": "medium",
  "matchedKeywords": ["React"],
  "missingKeywords": ["Docker"],
  "customInstructions": "Mention open to relocation"
}
```

**Controller logic:**
1. If `resumeText` provided (upload mode): `INSERT INTO resumes` → get new `resumeId`; best-effort extract structure
2. If `resumeId`: fetch resume + form_data from DB
3. Build `resumeText` via `getResumeText()`
4. Call `generateCoverLetterService(params)`
5. `INSERT INTO cover_letters` (new row each time — no upsert)
6. Return `{ coverLetter, resumeSaved }`

**Response 201:**
```json
{
  "coverLetter": { ...CoverLetterRecord },
  "resumeSaved": false
}
```

---

### `GET /api/cover-letter/`

Returns current user's last 10 cover letters across all resumes.

**SQL:**
```sql
SELECT cl.*, r.target_role
FROM cover_letters cl
LEFT JOIN resumes r ON cl.resume_id = r.id
WHERE cl.user_id = $1
ORDER BY cl.updated_at DESC
LIMIT 10
```

---

### `GET /api/cover-letter/resume/:resumeId`

All letters for a specific resume (ordered newest first).

**SQL:**
```sql
SELECT cl.*, r.target_role AS resume_target_role
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE cl.resume_id = $1 AND r.user_id = $2
ORDER BY cl.updated_at DESC
```

---

### `GET /api/cover-letter/:id`

Fetch a single letter by letter UUID.

**SQL:**
```sql
SELECT * FROM cover_letters WHERE id = $1 AND user_id = $2
```

---

### `PUT /api/cover-letter/:id`

Save user edits. Only updates `content` — never touches `generated_content`.

**Request body:** `{ "content": "string (1–10000 chars)" }`

**SQL:**
```sql
UPDATE cover_letters
SET content = $1, updated_at = NOW()
WHERE id = $2 AND user_id = $3
RETURNING *
```

---

### `DELETE /api/cover-letter/:id`

```sql
DELETE FROM cover_letters WHERE id = $1 AND user_id = $2 RETURNING id
```

---

### `POST /api/cover-letter/:id/regenerate`

Re-runs full generation (extract-keywords + generate) for an existing letter. Requires the letter to have a `resume_id` (not available for uploaded-only PDFs).

**SQL (fetch):**
```sql
SELECT cl.resume_id, r.parsed_text, r.target_role, rd.form_data
FROM cover_letters cl
LEFT JOIN resumes r ON cl.resume_id = r.id
LEFT JOIN resume_data rd ON r.id = rd.resume_id
WHERE cl.id = $1 AND cl.user_id = $2
```

**SQL (update):**
```sql
UPDATE cover_letters
SET content = $1, generated_content = $1, job_description = $2, updated_at = NOW()
WHERE id = $3
RETURNING *
```

---

### `POST /api/cover-letter/:id/improve`

Personalizes the letter by weaving in optional `whyThisCompany` and/or `achievementToHighlight`. At least one field required.

**Request body:**
```json
{
  "whyThisCompany": "string (max 300 chars)",
  "achievementToHighlight": "string (max 200 chars)"
}
```

**Logic:**
1. Fetch letter by `id` + `user_id`
2. Uses `baseContent = letter.generated_content || letter.content`
3. Calls AI improve service (gpt-4o-mini, temp 0.7)
4. Updates both `content` AND `generated_content` (improved version becomes the new base)

**SQL (update):**
```sql
UPDATE cover_letters
SET content = $1, generated_content = $1, updated_at = NOW()
WHERE id = $2
RETURNING *
```

---

## 6. AI Services

### 6a. `server/src/services/ai/keywordExtractor.ts`

**Config:** gpt-4o-mini, temperature 0.3, JSON mode

**Input sanitization:**
- `resumeText` → `sanitizePromptInput(resumeText).slice(0, 3000)`
- `jobDescription` → `sanitizePromptInput(jobDescription).slice(0, 2000)`

**System prompt:**
```
You are a keyword extraction assistant. Given a resume and job description, identify which keywords
from the job description are already present in the resume (matchedKeywords) and which are missing
(missingKeywords). Return a JSON object with exactly two arrays: "matchedKeywords" and
"missingKeywords". Each keyword should be a short phrase (1-3 words).
Return at most 10 matched and 10 missing keywords.
```

**User prompt:**
```
RESUME:
{sanitizedResume}

JOB DESCRIPTION:
{sanitizedJd}
```

**Returns:** `{ matchedKeywords: string[]; missingKeywords: string[] }`

---

### 6b. `server/src/services/ai/coverLetterGenerator.ts`

**Config:** gpt-4o-mini, temperature 0.8

**Word count mapping:**
```typescript
const WORD_COUNT_MAP = { short: 150, medium: 250, long: 400 };
```

**Input sanitization:**
- `jobDescription` → `sanitizePromptInput(jobDescription).slice(0, 2000)`
- `customInstructions` → `sanitizePromptInput(customInstructions)`
- `resumeText` → `.slice(0, 3000)` (already from DB, no further sanitization)

**System prompt:**
```
You are an expert cover letter writer for fresh graduates applying to junior roles.
Write in first person. Be specific and concise. Avoid generic openers like "I am writing to apply for".
Never use filler phrases like "I am passionate about" without concrete evidence.
Match the tone requested by the user.
Output ONLY the cover letter text — no subject line, no metadata, no commentary.
```

**User prompt:**
```
Write a cover letter for the following candidate.

CANDIDATE NAME: {fullName}
TARGET ROLE: {targetRole}
LOCATION: {targetLocation}
COMPANY: {companyName}
HIRING MANAGER: {hiringManagerName || 'Hiring Manager'}

CANDIDATE RESUME SUMMARY:
{truncatedResumeText}

JOB DESCRIPTION:
{sanitizedJd}

KEYWORDS ALREADY IN RESUME (naturally reference these): {matchedKeywords.join(', ') || 'None'}
KEYWORDS MISSING FROM RESUME (weave these in naturally where truthful): {missingKeywords.join(', ') || 'None'}

TONE: {tone}
- professional: confident, polished, industry-standard language
- enthusiastic: energetic and passionate while remaining professional
- formal: conservative, no contractions, suitable for finance/law/government
- conversational: warm and approachable, contractions OK, suitable for startups

TARGET LENGTH: approximately {wordCount} words

ADDITIONAL INSTRUCTIONS: {sanitizedInstructions || 'None'}
```

**Returns:** `Promise<string>` — plain text cover letter

---

### 6c. Improve AI (inline in `coverLetterController.ts`)

**Config:** gpt-4o-mini, temperature 0.7

**System prompt:**
```
Take this cover letter and improve it by weaving in the personalizations naturally.
Preserve tone, structure, and length. Return only the improved cover letter text.
```

**User prompt:**
```
CURRENT COVER LETTER:
{baseContent}

PERSONALIZATIONS TO WEAVE IN:
Why this company: {whyThisCompany || 'N/A'}
Achievement to highlight: {achievementToHighlight || 'N/A'}

Return only the improved cover letter text with these elements naturally integrated.
```

---

## 7. Frontend Architecture

### `useCoverLetters` Hook

**Signature:** `useCoverLetters(resumeId: string | null): UseCoverLettersReturn`

**Initial load (when `resumeId` changes):**
```typescript
useEffect(() => {
  if (!resumeId) return;
  const cancelled = false;
  listCoverLettersByResumeApi(resumeId)
    .then(data => {
      if (cancelled) return;
      setCoverLetters(data.coverLetters);
      if (data.coverLetters.length > 0) {
        setActiveLetter(data.coverLetters[0]);
        setMode('edit');
      }
    })
    .catch(() => {});
  return () => { /* cancelled = true */ };
}, [resumeId]);
```

**`create()` method flow:**
```
setProgressStep('extracting')
→ POST /cover-letter/extract-keywords (with resumeId or resumeText)
→ setKeywords({ matched, missing })
→ setProgressStep('keywords-ready')
→ sleep(1200ms)
→ setProgressStep('generating')
→ POST /cover-letter/generate (with keywords + form data)
→ setCoverLetters(prev => [newLetter, ...prev])
→ setActiveLetter(newLetter)
→ setProgressStep('done')
// catch → setProgressStep('error'), setError(message)
```

**`parseUploadedFile()` method:**
```
upload File via POST /api/resume/upload-simple (Cloudinary, no text extraction)
→ store uploadedResumeId, uploadedResumeFilePath
→ setResumeInputMode('existing') implicitly for generation
```

**`improve()` method:**
```
POST /cover-letter/:id/improve { whyThisCompany, achievementToHighlight }
→ setActiveLetter(updated)
→ update coverLetters array
```

---

### `CoverLetterPage.tsx` — Key State

```typescript
// Step machine
const [step, setStep] = useState<'select-resume' | 'editor'>('select-resume');

// Resume selection
const [resumes, setResumes] = useState<any[]>([]);
const [selectedResumeId, setSelectedResumeId] = useState('');
const effectiveResumeId = step === 'editor' ? (selectedResumeId || null) : null;

// Form fields
const fullName = user?.name || '';
const [jobDescription, setJobDescription] = useState('');
const [companyName, setCompanyName] = useState('');
const [jobTitle, setJobTitle] = useState('');
const [hiringManagerName, setHiringManagerName] = useState('');
const [tone, setTone] = useState<CoverLetterTone>('professional');
const [length, setLength] = useState<CoverLetterLength>('medium');
const [customInstructions, setCustomInstructions] = useState('');

// UI state
const [showResumePreview, setShowResumePreview] = useState(false);
const [resumePreviewData, setResumePreviewData] = useState<{ formData: ResumeFormData; templateId: string } | null>(null);
const [isLeftJDExpanded, setIsLeftJDExpanded] = useState(false);
const [showRefinePanel, setShowRefinePanel] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateId>(DEFAULT_TEMPLATE_ID);
const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
const [editorHtml, setEditorHtml] = useState('');
```

### Key `useEffect`s in `CoverLetterPage`

| Effect | Trigger | Action |
|--------|---------|--------|
| Fetch resumes | `[]` | `listResumes()` → `setResumes` |
| Fetch contact info | `[selectedResumeId]` | `getResume(id)` → `setResumeContactInfo` |
| Merge extracted contact | `[extractedContactInfo]` | Fill in missing email/phone/address |
| Reset preview data | `[selectedResumeId]` | `setResumePreviewData(null)` |
| Deep-link `?id=` | `[]` | `setStep('editor')`, `loadLetter(id)` |
| Deep-link `?resume_id=` | `[]` | `setSelectedResumeId`, `setResumeInputMode('existing')`, `setStep('editor')`, `setShowResumePreview(true)` |
| Sync editor | `[activeLetter?.id, activeLetter?.content]` | `setEditorHtml(activeLetter.content)` |
| Sync form fields | `[activeLetter?.id]` | Fill companyName, jobTitle, tone, length, etc. |
| Auto-advance upload | `[uploadedResumeId, resumeInputMode]` | If upload mode + id: `setSelectedResumeId`, `setStep('editor')` |
| Fetch preview data | `[showResumePreview, selectedResumeId, ...]` | `getResume(id)` → `setResumePreviewData` if form_data exists |
| Beforeunload | `[step]` | Block window close when in editor step |

### Resume Preview Panel

When the amber **Resume** button is clicked:
- If resume has `file_path` (Path A, uploaded PDF): renders `<iframe src="/api/resume/:id/file">` (proxied from Cloudinary)
- If resume has `form_data` (Path B, builder): renders `<ResumeTemplateSwitcher data={formData} templateId={templateId} />` inside a scaled container

The Resume button only renders when `selectedResumeId` is truthy:
```tsx
{selectedResumeId && (
  <button onClick={() => setShowResumePreview(true)}>
    <Eye size={12} /> Resume
  </button>
)}
```

### Export

**PDF export** (two cover letter templates):
- `bold_architect` — sans-serif, modern layout
- `default` — serif, classic layout
- Builds full HTML with inline styles → `POST /api/export/pdf-from-html`
- `buildFullPdfHtml()` helper constructs the HTML

**TXT export:**
- `buildFullPlainText()` → name, job title, contact info, date, recipient block, body
- `new Blob([text], { type: 'text/plain' })` → anchor download

---

## 8. Business Flow Diagrams

### Generation Flow
```
User clicks "Generate Cover Letter"
│
├─ coverLetters.length > 0? → Show regen confirm dialog
│
▼
create(payload)
│
├─ 1. POST /extract-keywords
│      → progressStep = 'extracting'
│      → returns { matchedKeywords, missingKeywords, contactInfo }
│      → progressStep = 'keywords-ready' (badge preview shown)
│      → sleep(1200ms)
│
├─ 2. POST /generate
│      → progressStep = 'generating'
│      → AI writes letter (INSERT new row, no upsert)
│      → returns { coverLetter, resumeSaved }
│
└─ 3. progressStep = 'done'
       → letter shown in TipTap editor
       → ATS badges computed client-side
```

### Improve Flow
```
User fills whyThisCompany / achievementToHighlight
User clicks "Improve Letter"
│
├─ Letter has been manually edited? → Show confirm dialog
│
▼
improve(letterId, whyThisCompany, achievementToHighlight)
│
└─ POST /cover-letter/:id/improve
       → AI weaves personalizations into generated_content base
       → updates both content AND generated_content
       → activeLetter updated in state
```

### Save Flow
```
User edits TipTap editor → editorHtml state
User clicks "Save Changes"
│
└─ PUT /cover-letter/:id { content: editorHtml }
       → only content updated, generated_content unchanged
       → savedIndicator = true (2s) → "Saved ✓" feedback
```

---

## 9. Validation Rules

### Backend (express-validator)

| Endpoint | Field | Rules |
|----------|-------|-------|
| extract-keywords | resumeId | optional, UUID |
| extract-keywords | resumeText | optional, string, not empty |
| extract-keywords | jobDescription | required, string, max 5000 |
| generate | fullName | required, string |
| generate | jobDescription | required, string, max 5000 |
| generate | companyName | required, string |
| generate | tone | required, one of 4 values |
| generate | wordCountTarget | required, one of 3 values |
| generate | resumeId | optional, UUID |
| generate | resumeText | optional, string, max 5000 |
| generate | hiringManagerName | optional, max 255 |
| generate | jobTitle | optional, max 255 |
| generate | customInstructions | optional, max 500 |
| update | content | required, string, max 10000 |
| improve | whyThisCompany | optional, max 300 |
| improve | achievementToHighlight | optional, max 200 |

Note: `extract-keywords` requires `oneOf([resumeId, resumeText])` — at least one must be provided.

### Frontend constraints

| Field | Where enforced |
|-------|---------------|
| Job description: max 5000 | `<textarea maxLength={5000}>` + char counter |
| Custom instructions: max 500 | `isCustomInstructionsTooLong` disables Generate button |
| Company name: required | `isGenerateDisabled` check |
| Resume: must be selected | `isGenerateDisabled` check |

---

## 10. Error Handling

### Backend pattern
```typescript
try { ... } catch(err) { next(err) }
```
Global error handler in `server/src/middleware/errorHandler.ts`.

Specific errors:
- `404` — resume/letter not found or doesn't belong to user
- `400` — validation errors (express-validator returns 400)
- `400` — "Regenerate not available for uploaded PDFs" (when `resume_id` is null)
- `400` — "Please provide at least one of whyThisCompany or achievementToHighlight" (improve endpoint)

### Frontend (`useCoverLetters`)
```typescript
catch (err: any) {
  setProgressStep('error');
  setError(
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Failed to generate cover letter'
  );
}
```
Error state renders a red card with message + "Try again" button (calls `reset()` → `'idle'`).

---

## 11. Security

### Prompt Injection Sanitization (`server/src/utils/sanitizePromptInput.ts`)

All user-supplied text injected into AI prompts passes through `sanitizePromptInput()`:
- Strips null bytes and control chars (keeps `\n`, `\r`, `\t`)
- Replaces injection phrases: `ignore previous instructions`, `you are now`, `new instructions`, `system:`, `[system]`, `<< SYS >>`, etc.
- Truncates to 8000 chars

Applied to: `jobDescription`, `customInstructions`, `whyThisCompany`, `achievementToHighlight`

### Rate Limiting
`aiLimiter` (10 requests per 15 minutes per IP) applied to:
- `POST /extract-keywords`
- `POST /generate`
- `POST /:id/regenerate`
- `POST /:id/improve`

### Authentication
All routes require `isAuthenticated`. Ownership verified in every query by joining against `resumes.user_id = userId` or filtering by `cl.user_id = userId`. Cross-user access is impossible.

---

## 12. Testing Patterns

### Backend (`server/src/controllers/__tests__/coverLetterController.test.ts`)

**Required mocks:**
```typescript
jest.mock('../../config/db')                            // mock pool.query
jest.mock('../../services/ai/coverLetterGenerator')     // mock generateCoverLetter
jest.mock('../../services/ai/keywordExtractor')         // mock extractKeywords
jest.mock('../../services/ai/resumeStructureExtractor') // mock extractResumeStructure
```

**Auth in tests:** `req.user = { id: 'user-uuid' }` via test middleware.

**UUID format:** Validators require valid UUID v4:
```typescript
const RESUME_ID = '11111111-1111-4111-8111-111111111111';
```

**Validation returns 400** (not 422).

### Frontend (`client/src/pages/__tests__/CoverLetterPage.test.tsx`)

**Required mocks:**
```typescript
vi.mock('../../hooks/useCoverLetters')
vi.mock('../../utils/api')       // listResumes, getResume
vi.mock('@tiptap/react')         // mock useEditor, EditorContent
vi.mock('@tiptap/starter-kit')
```

**`useCoverLetters` mock must match full interface:**
```typescript
const defaultHookReturn = {
  coverLetters: [], activeLetter: null, mode: 'new' as const,
  keywords: { matched: [], missing: [] },
  progressStep: 'idle' as const,
  isLoading: false, isSaving: false, savedIndicator: false, error: null,
  resumeInputMode: 'existing' as const,
  uploadedResumeText: null, uploadedFileName: null,
  uploadedResumeId: null, uploadedResumeFilePath: null,
  isParsing: false, parseError: null, extractedContactInfo: null,
  startNew: vi.fn(), selectLetter: vi.fn(), loadLetter: vi.fn(),
  create: vi.fn(), regenerate: vi.fn(), save: vi.fn(), remove: vi.fn(),
  reset: vi.fn(), setResumeInputMode: vi.fn(),
  parseUploadedFile: vi.fn(), improve: vi.fn(),
};
```

**Route:** `/cover-letter/new` (not `/resume/:id/cover-letter`).

**Pattern for progress step tests:** Set `progressStep: 'extracting'` in hook mock.

**"Try again" button** calls `reset()` — not `clearError()`.

---

## 13. Key File Index

| File | Purpose |
|------|---------|
| `client/src/pages/CoverLetterPage.tsx` | Main page — selection step + editor step |
| `client/src/hooks/useCoverLetters.ts` | State machine for all cover letter operations |
| `client/src/utils/api.ts` | All HTTP calls (extractKeywords, generateCoverLetter, etc.) |
| `client/src/components/cover-letter/BoldArchitectTemplate.tsx` | Bold PDF template component |
| `client/src/types/index.ts` | CoverLetter, Keywords, GenerateCoverLetterPayload types |
| `server/src/controllers/coverLetterController.ts` | All 9 handler functions |
| `server/src/routes/coverLetter/index.ts` | Route definitions + express-validator chains |
| `server/src/services/ai/coverLetterGenerator.ts` | GPT-4o-mini letter generation |
| `server/src/services/ai/keywordExtractor.ts` | GPT-4o-mini keyword extraction |
| `server/src/types/coverLetter.types.ts` | Backend type definitions |
| `server/src/migrations/022_create_cover_letters.ts` | Initial schema |
| `server/src/migrations/027_cover_letters_multiple.ts` | Drop unique, add job_title |
| `server/src/migrations/028_cover_letters_nullable_resume.ts` | Allow null resume_id |
| `server/src/migrations/030_cover_letters_add_job_description.ts` | Add job_description column |

---

## 14. Production Checklist

### Environment Variables Required

```bash
# Core
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Auth
SESSION_SECRET=<64+ chars random entropy — use: openssl rand -hex 32>

# AI
OPENAI_API_KEY=sk-...

# CORS — must match deployed frontend URL exactly (no trailing slash)
CLIENT_URL=https://yourdomain.com

# Cloudinary (required for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (required for email verification + password reset)
RESEND_API_KEY=re_...
FROM_EMAIL=AI Resume Builder <noreply@yourdomain.com>
```

### Pre-Deploy Steps

```bash
# 1. Install dependencies
cd server && npm install --production
cd client && npm install

# 2. Run database migrations (idempotent — safe to re-run)
cd server && npm run migrate

# 3. Build frontend
cd client && npm run build   # outputs to client/dist/

# 4. Build backend
cd server && npm run build   # outputs to server/dist/

# 5. Start
NODE_ENV=production node server/dist/app.js
```

### Health Check
`GET /api/health` — returns `{ status: 'healthy' | 'degraded', checks: { db } }`. Use this for load balancer / uptime checks.

### Rate Limits Review
- `aiLimiter`: 10 AI requests per 15 minutes per IP — applied to extract-keywords, generate, regenerate, improve
- `forgotPasswordLimiter`: 5 requests per hour per IP
- `parseTextLimiter`: separate limit on PDF parse endpoint
- Consider increasing limits or switching to user-based limiting post-launch based on real usage

### Security Checklist
- [ ] `SESSION_SECRET` is cryptographically random (≥32 bytes)
- [ ] `CLIENT_URL` locked to production domain (no wildcards)
- [ ] Cloudinary credentials are scoped (upload preset, not full account access if possible)
- [ ] `OPENAI_API_KEY` has spending limit set in OpenAI dashboard
- [ ] All routes under `/api/cover-letter` require `isAuthenticated` ✓ (enforced in router)
- [ ] `express.json({ limit: '10mb' })` — appropriate for base64 photo payloads
- [ ] Multer PDF filter rejects non-PDF uploads ✓

### Common Go-Live Issues
| Symptom | Likely Cause |
|---------|-------------|
| CORS errors in browser | `CLIENT_URL` doesn't match deployed frontend origin exactly |
| Sessions not persisting | `SESSION_SECRET` changed between deploys; or `secure: true` without HTTPS |
| Email verification not sending | `RESEND_API_KEY` not set; domain not verified in Resend dashboard |
| PDF uploads fail | `CLOUDINARY_*` vars missing or incorrect |
| AI calls fail silently | `OPENAI_API_KEY` invalid or quota exceeded |
| `npm run migrate` fails | `DATABASE_URL` connection string incorrect; DB not accessible |
| 404 on page refresh (SPA) | `NODE_ENV=production` not set — Express won't serve `client/dist` otherwise |
