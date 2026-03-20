# Cover Letter Generator â€” Complete Feature Documentation

> This document contains everything needed to replicate the Cover Letter Generator feature from scratch. It covers database schema, TypeScript types, API contracts, AI service logic (with full prompts), frontend architecture, and business rules.

---

## 1. Feature Overview

### Business Purpose
Users generate ATS-optimized cover letters from their existing resumes + a pasted job description. The AI extracts keyword matches first (so the cover letter naturally weaves in missing JD terms), then writes the letter. Users can edit inline, revert to the AI original, and download as PDF or TXT.

### Two Entry Points
| Mode | URL | Behaviour |
|------|-----|-----------|
| **Standalone** | `/cover-letter/new` | Resume selector dropdown; user picks which of their resumes to base the letter on |
| **Attached** (future / navigated) | `/cover-letter/new?resumeId=<uuid>` | Resume pre-selected; form pre-fills from resume data |

In both cases the same `CoverLetterPage.tsx` is rendered. The difference is whether `selectedResumeId` starts populated.

### User Flow (happy path)
1. User selects resume â†’ fills job description + company + optional fields â†’ clicks **Generate Cover Letter**
2. Frontend calls `POST /api/cover-letter/extract-keywords` (Step 1: scanning)
3. Keywords returned â†’ displayed as green/red badge preview (Step 2: keyword-ready, 1.2 s pause)
4. Frontend calls `POST /api/cover-letter/generate` with keywords injected (Step 3: writing)
5. Letter appears in editable textarea; ATS keyword coverage badges shown below
6. User edits text â†’ clicks **Save Changes** â†’ `PUT /api/cover-letter/:resumeId`
7. User downloads PDF or TXT

### Key Business Rules
- **One cover letter per resume** â€” `UNIQUE(resume_id)` in DB; generate upserts
- **Revert to AI original** â€” `generated_content` column is never overwritten on save; `content` is the mutable copy
- **Keyword coverage badges** â€” live, computed client-side by `editableContent.toLowerCase().includes(keyword)` as user types
- **Word-count colour feedback** â€” green 200â€“450 words, yellow 150â€“199 or 451â€“550, red otherwise
- **Custom instructions** capped at 500 characters (both backend validator + frontend counter)
- **Job description** capped at 5000 characters (frontend `maxLength` + backend validator)
- **Confirm dialog** shown if user clicks Generate when a letter already exists (prevents accidental overwrite)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| AI model | GPT-4o-mini (OpenAI) |
| Keyword extraction | temp 0.3, `response_format: { type: 'json_object' }` |
| Letter generation | temp 0.8, plain text output |
| Backend | Node.js + Express 4 + TypeScript |
| Database | PostgreSQL â€” raw `pg` pool, UUID PKs |
| Auth | Passport.js session, `isAuthenticated` middleware |
| Validation | express-validator (`body()` chain) |
| Rate limiting | `aiLimiter` (10 req / 15 min per IP) applied to both `/extract-keywords` and `/generate` routes in `app.ts` |
| Frontend | React 18 + TypeScript + TailwindCSS + Vite |
| HTTP client | axios (baseURL `/api`, `withCredentials: true`) |
| PDF export | Puppeteer via existing `POST /api/export/pdf-from-html` endpoint |

---

## 3. Database Schema

### Migration: `server/src/migrations/022_create_cover_letters.ts`

```sql
CREATE TABLE IF NOT EXISTS cover_letters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id             UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content               TEXT NOT NULL,          -- mutable (user edits this)
  generated_content     TEXT NOT NULL,          -- immutable AI output (for revert)
  tone                  VARCHAR(50) NOT NULL DEFAULT 'professional',
  word_count_target     VARCHAR(20) NOT NULL DEFAULT 'medium',
  company_name          VARCHAR(255),
  hiring_manager_name   VARCHAR(255),
  custom_instructions   TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id)     -- one cover letter per resume
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_resume_id ON cover_letters(resume_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id   ON cover_letters(user_id);
```

**Key design decisions:**
- `UNIQUE(resume_id)` â€” generate uses `ON CONFLICT (resume_id) DO UPDATE` (upsert)
- `ON DELETE CASCADE` â€” deleting a resume auto-deletes its cover letter
- `content` vs `generated_content` â€” `content` is what the user saves edits to; `generated_content` is frozen at generation time and used for "Revert to AI original"

---

## 4. TypeScript Interfaces

### Server â€” `server/src/types/coverLetter.types.ts`

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';

export interface GenerateCoverLetterRequest {
  resumeId: string;
  fullName: string;
  targetRole: string;
  targetLocation: string;
  jobDescription: string;          // required; max 5000 chars
  companyName: string;             // required
  hiringManagerName?: string;      // optional; defaults to "Hiring Manager" in prompt
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  matchedKeywords?: string[];      // from prior extract-keywords call
  missingKeywords?: string[];
  customInstructions?: string;     // max 500 chars
}

export interface CoverLetterRecord {
  id: string;
  resume_id: string;
  user_id: string;
  content: string;            // editable copy
  generated_content: string;  // original AI output
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}
```

### Client â€” `client/src/types/index.ts` (relevant additions)

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';
export type ProgressStep = 'idle' | 'extracting' | 'keywords-ready' | 'generating' | 'done' | 'error';

export interface CoverLetter {
  id: string;
  resume_id: string;
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Keywords {
  matched: string[];
  missing: string[];
}

export interface GenerateCoverLetterPayload {
  resumeId: string;
  fullName: string;
  targetRole: string;
  targetLocation: string;
  jobDescription: string;
  companyName: string;
  hiringManagerName?: string;
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  customInstructions?: string;
}
```

---

## 5. API Endpoints

All routes are mounted at `/api/cover-letter` in `server/src/app.ts`. All require authentication (`isAuthenticated` middleware).

### Route file: `server/src/routes/coverLetter/index.ts`

```
POST   /api/cover-letter/extract-keywords   â†’ extractKeywords
GET    /api/cover-letter/                   â†’ listCoverLetters
POST   /api/cover-letter/generate           â†’ generateCoverLetter
GET    /api/cover-letter/:resumeId          â†’ getCoverLetter
PUT    /api/cover-letter/:resumeId          â†’ updateCoverLetter
DELETE /api/cover-letter/:resumeId          â†’ deleteCoverLetter
```

---

### `POST /api/cover-letter/extract-keywords`

**Rate limited** by `aiLimiter` (10 req/15 min per IP).

**Request body:**
```json
{
  "resumeId": "uuid-v4",
  "jobDescription": "string (1â€“5000 chars)"
}
```

**Validation rules (express-validator):**
- `resumeId` â€” exists, isUUID
- `jobDescription` â€” exists, isString, notEmpty, isLength max 5000

**Controller logic:**
1. Query `resumes` + LEFT JOIN `resume_data` for `resumeId` + `userId`
2. Build `resumeText` from `parsed_text` (Path A) OR `form_data` (Path B) â€” see `getResumeText()` helper
3. Call `extractKeywords({ resumeText, jobDescription })`
4. Return `{ matchedKeywords: string[], missingKeywords: string[] }`

**Response 200:**
```json
{
  "matchedKeywords": ["React", "TypeScript", "REST APIs"],
  "missingKeywords": ["Docker", "CI/CD", "GraphQL"]
}
```

**Errors:**
- `404` â€” resume not found or doesn't belong to user
- `400` â€” resume has no parseable content (`"This resume has no content to extract keywords from..."`)
- `400` â€” validation errors (express-validator returns 400, not 422)

---

### `POST /api/cover-letter/generate`

**Rate limited** by `aiLimiter` (10 req / 15 min per IP).

**Request body:**
```json
{
  "resumeId": "uuid-v4",
  "fullName": "Jane Doe",
  "targetRole": "Software Engineer",
  "targetLocation": "London, UK",
  "jobDescription": "string (1â€“5000 chars)",
  "companyName": "Acme Corp",
  "hiringManagerName": "John Smith",      // optional
  "tone": "professional",
  "wordCountTarget": "medium",
  "matchedKeywords": ["React", "TypeScript"],
  "missingKeywords": ["Docker", "CI/CD"],
  "customInstructions": "Mention I'm open to relocation"  // optional, max 500
}
```

**Validation rules:**
- `resumeId` â€” exists, isUUID
- `fullName` â€” exists, isString, notEmpty
- `targetRole` â€” exists, isString, notEmpty
- `targetLocation` â€” exists, isString, notEmpty
- `jobDescription` â€” exists, isString, notEmpty, max 5000
- `companyName` â€” exists, isString, notEmpty
- `tone` â€” isIn `['professional', 'enthusiastic', 'formal', 'conversational']`
- `wordCountTarget` â€” isIn `['short', 'medium', 'long']`
- `matchedKeywords` â€” optional, isArray
- `missingKeywords` â€” optional, isArray
- `hiringManagerName` â€” optional, isString, trim, max 255
- `customInstructions` â€” optional, isString, max 500

**Controller logic:**
1. Query resume + form_data (same JOIN as extract-keywords)
2. Build `resumeText` via `getResumeText()` helper
3. Call `generateCoverLetter(params)` AI service
4. Upsert into `cover_letters` with `ON CONFLICT (resume_id) DO UPDATE`
   - Both `content` and `generated_content` set to the AI output on generate
5. Return `{ coverLetter: CoverLetterRecord }`

**Response 201:**
```json
{
  "coverLetter": {
    "id": "uuid",
    "resume_id": "uuid",
    "user_id": "uuid",
    "content": "Dear John Smith,\n\nI am excited...",
    "generated_content": "Dear John Smith,\n\nI am excited...",
    "tone": "professional",
    "word_count_target": "medium",
    "company_name": "Acme Corp",
    "hiring_manager_name": "John Smith",
    "custom_instructions": null,
    "created_at": "2026-03-09T10:00:00Z",
    "updated_at": "2026-03-09T10:00:00Z"
  }
}
```

---

### `GET /api/cover-letter/`

Returns the current user's cover letters (most recent 10), joined with `resumes.target_role`.

**Response 200:**
```json
{
  "coverLetters": [
    { "id": "uuid", "resume_id": "uuid", "content": "...", "target_role": "Software Engineer", ... }
  ]
}
```

**SQL:**
```sql
SELECT cl.*, r.target_role
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE r.user_id = $1
ORDER BY cl.updated_at DESC
LIMIT 10
```

---

### `GET /api/cover-letter/:resumeId`

Fetches the single cover letter for a specific resume.

**Response 200:**
```json
{ "coverLetter": { ...CoverLetterRecord } }
```

**Response 404:** `{ "message": "No cover letter found for this resume" }`

**SQL:**
```sql
SELECT cl.*
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE cl.resume_id = $1 AND r.user_id = $2
```

---

### `PUT /api/cover-letter/:resumeId`

Saves user edits. Only updates `content` â€” never touches `generated_content`.

**Request body:**
```json
{ "content": "string (1â€“10000 chars)" }
```

**Validation:** `content` â€” exists, isString, notEmpty, max 10000

**SQL:**
```sql
UPDATE cover_letters cl
SET content = $1, updated_at = NOW()
FROM resumes r
WHERE cl.resume_id = r.id
  AND cl.resume_id = $2
  AND r.user_id = $3
RETURNING cl.*
```

---

### `DELETE /api/cover-letter/:resumeId`

**SQL:**
```sql
DELETE FROM cover_letters cl
USING resumes r
WHERE cl.resume_id = r.id
  AND cl.resume_id = $1
  AND r.user_id = $2
RETURNING cl.id
```

---

## 6. Backend AI Services

### 6a. `server/src/services/ai/keywordExtractor.ts`

**Purpose:** Extract matched and missing keywords between resume and job description.

**Config:**
- Model: `gpt-4o-mini`
- Temperature: `0.3`
- Response format: `{ type: 'json_object' }` (JSON mode â€” guaranteed JSON output)

**Input sanitization:**
- `resumeText` â†’ `sanitizePromptInput(resumeText).slice(0, 3000)`
- `jobDescription` â†’ `sanitizePromptInput(jobDescription).slice(0, 2000)`

**System prompt:**
```
You are a keyword extraction assistant. Given a resume and job description, identify which keywords from the job description are already present in the resume (matchedKeywords) and which are missing (missingKeywords). Return a JSON object with exactly two arrays: "matchedKeywords" and "missingKeywords". Each keyword should be a short phrase (1-3 words). Return at most 10 matched and 10 missing keywords.
```

**User prompt:**
```
RESUME:
{sanitizedResume}

JOB DESCRIPTION:
{sanitizedJd}
```

**Output parsing:**
```typescript
const parsed = JSON.parse(content);
return {
  matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
  missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
};
```

**Return type:** `{ matchedKeywords: string[]; missingKeywords: string[] }`

---

### 6b. `server/src/services/ai/coverLetterGenerator.ts`

**Purpose:** Write a complete cover letter in plain text.

**Config:**
- Model: `gpt-4o-mini`
- Temperature: `0.8` (higher for creative text)
- No response_format (plain text expected)

**Word count mapping:**
```typescript
const WORD_COUNT_MAP = { short: 150, medium: 250, long: 400 };
```

**Input sanitization / truncation:**
- `jobDescription` â†’ `sanitizePromptInput(jobDescription).slice(0, 2000)`
- `customInstructions` â†’ `sanitizePromptInput(customInstructions)` (if present)
- `resumeText` â†’ `.slice(0, 3000)` (no sanitization â€” already from DB)

**System prompt:**
```
You are an expert cover letter writer for fresh graduates applying to junior roles.
Write in first person. Be specific and concise. Avoid generic openers like "I am writing to apply for". Never use filler phrases like "I am passionate about" without concrete evidence. Match the tone requested by the user.
Output ONLY the cover letter text â€” no subject line, no metadata, no commentary.
```

**User prompt template:**
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

**Return type:** `Promise<string>` â€” the plain text cover letter

---

### `buildResumeTextFromFormData()` helper (in controller)

When resume has no `parsed_text` (Path B â€” builder), the controller reconstructs a text representation from `form_data` JSONB:

```typescript
function buildResumeTextFromFormData(formData: any): string {
  const lines: string[] = [];
  if (formData.fullName) lines.push(formData.fullName);
  if (formData.targetRole) lines.push(`Target Role: ${formData.targetRole}`);
  if (formData.professionalSummary) lines.push(`Summary: ${formData.professionalSummary}`);
  // experience entries: "role at company: responsibilities"
  // skills.technical categories: "category: item1, item2"
  // skills.soft: "Soft skills: skill1, skill2"
  return lines.join('\n');
}
```

`getResumeText()` returns `parsed_text` if truthy, else falls back to `buildResumeTextFromFormData(form_data)`.

---

## 7. Controller Logic (complete SQL queries)

### `extractKeywords` controller

```typescript
// 1. Ownership check + form_data JOIN
SELECT r.*, rd.form_data
FROM resumes r
LEFT JOIN resume_data rd ON r.id = rd.resume_id
WHERE r.id = $1 AND r.user_id = $2

// 2. Call extractKeywordsService({ resumeText, jobDescription })
// 3. Return result directly
```

### `generateCoverLetter` controller

```typescript
// 1. Same ownership query (with form_data JOIN)

// 2. Call generateCoverLetterService(params)

// 3. Upsert
INSERT INTO cover_letters (resume_id, user_id, content, generated_content, tone, word_count_target, company_name, hiring_manager_name, custom_instructions)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (resume_id)
DO UPDATE SET
  content = EXCLUDED.content,
  generated_content = EXCLUDED.generated_content,
  tone = EXCLUDED.tone,
  word_count_target = EXCLUDED.word_count_target,
  company_name = EXCLUDED.company_name,
  hiring_manager_name = EXCLUDED.hiring_manager_name,
  custom_instructions = EXCLUDED.custom_instructions,
  updated_at = NOW()
RETURNING *
```

Note: both `content` and `generated_content` receive the same AI-generated value at generation time.

### `listCoverLetters` controller

```sql
SELECT cl.*, r.target_role
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE r.user_id = $1
ORDER BY cl.updated_at DESC
LIMIT 10
```

### `getCoverLetter` controller

```sql
SELECT cl.*
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE cl.resume_id = $1 AND r.user_id = $2
```

### `updateCoverLetter` controller

```sql
UPDATE cover_letters cl
SET content = $1, updated_at = NOW()
FROM resumes r
WHERE cl.resume_id = r.id
  AND cl.resume_id = $2
  AND r.user_id = $3
RETURNING cl.*
```

### `deleteCoverLetter` controller

```sql
DELETE FROM cover_letters cl
USING resumes r
WHERE cl.resume_id = r.id
  AND cl.resume_id = $1
  AND r.user_id = $2
RETURNING cl.id
```

---

## 8. Frontend Architecture

### `client/src/hooks/useCoverLetter.ts`

**State machine:**

```
idle â†’ extracting â†’ keywords-ready â†’ generating â†’ done
                                                 â†˜ error
```

**Hook return interface (`UseCoverLetterReturn`):**
| Property | Type | Purpose |
|----------|------|---------|
| `coverLetter` | `CoverLetter \| null` | Currently loaded/generated letter |
| `keywords` | `Keywords` | `{ matched: string[], missing: string[] }` from extract-keywords |
| `progressStep` | `ProgressStep` | Current generation step |
| `isLoading` | `boolean` | Initial fetch in progress |
| `isSaving` | `boolean` | Save in progress |
| `savedIndicator` | `boolean` | True for 2s after successful save |
| `error` | `string \| null` | Error message |
| `generate` | `(payload) => Promise<void>` | Runs extract-keywords then generate |
| `save` | `(content: string) => Promise<void>` | Calls PUT to persist edits |
| `reset` | `() => void` | Resets progressStep to 'idle', clears error |

**`useEffect` on `resumeId`:**
- Resets all state on every `resumeId` change
- Fetches `GET /api/cover-letter/:resumeId`
- 404 is silently ignored (no letter yet = valid state)
- Uses `cancelled` flag to prevent state updates after unmount/re-render

**`generate(payload)` flow:**
```typescript
setProgressStep('extracting');
const res = await extractKeywordsApi(payload.resumeId, payload.jobDescription);
setKeywords({ matched, missing });
setProgressStep('keywords-ready');
await sleep(1200);              // deliberate 1.2s pause so user sees the keyword preview
setProgressStep('generating');
const genRes = await generateCoverLetterApi({ ...payload, matchedKeywords, missingKeywords });
setCoverLetter(genRes.data.coverLetter);
setProgressStep('done');
// catch â†’ setProgressStep('error'), setError(...)
```

**`save(content)` flow:**
- Determines ID: `resumeId || coverLetter?.resume_id`
- Calls `PUT /api/cover-letter/:resumeId`
- Updates local `coverLetter.content`
- Sets `savedIndicator = true` for 2000 ms

**`reset()`:** Sets step back to `'idle'`, clears error.

---

### `client/src/pages/CoverLetterPage.tsx`

**Layout:** Two-panel split â€” left (controls, fixed 384px), right (output, flex fill).

**Left panel form fields:**
| Field | Required | Constraint |
|-------|----------|-----------|
| Resume selector | Yes (for generation) | `<select>` from `listResumes()` |
| Full Name | No | `maxLength={255}`, pre-fills from `user.name` |
| Target Role | No | `maxLength={255}` |
| Target Location | No | `maxLength={255}` |
| Job Description | Yes | `maxLength={5000}`, char counter shown |
| Company Name | Yes | `maxLength={255}` |
| Hiring Manager | No | `maxLength={255}` |
| Tone | No | Pill buttons: Professional / Enthusiastic / Formal / Conversational |
| Length | No | Radio: Short (~150w) / Medium (~250w) / Long (~400w) |
| Custom Instructions | No | `<textarea>`, 500-char limit with colour counter |

**Generate button disabled when:**
- `!selectedResumeId`
- `!jobDescription.trim()`
- `!companyName.trim()`
- `customInstructions.length > 500`
- `isGenerating` (any of extracting / keywords-ready / generating)

**Right panel states (mutually exclusive):**
| State | Condition |
|-------|-----------|
| Spinner | `isLoading` |
| Empty state | `!isLoading && !showProgress && !showError && !showLetter` |
| 3-step progress | `isGenerating` |
| Error card | `progressStep === 'error'` |
| Letter + controls | `coverLetter !== null && (step === 'idle' || step === 'done')` |

**3-step progress UI:**
- Step 1 "Scanning resume and job description" â€” active during `extracting`
- Step 2 "Analyzing keyword matches" â€” active during `keywords-ready` (badge preview shown)
- Step 3 "Writing your ATS-optimized cover letter" â€” active during `generating`

**Letter output section:**
- Editable `<textarea>` (font-mono, flex-1)
- Word count with colour feedback (green/yellow/red)
- "Revert to AI original" link â€” shown when `editableContent !== coverLetter.generated_content`
- **ATS Keyword Coverage** badges â€” each keyword checked against `editableContent.toLowerCase()` live
- Action bar: Save Changes / Download PDF / Download .txt

**Regenerate confirm dialog:** Modal shown when user clicks Generate and `coverLetter !== null`.

**PDF download:** Wraps `editableContent` in `<p>` tags, POSTs HTML to `POST /api/export/pdf-from-html`.

**TXT download:** `new Blob([editableContent], { type: 'text/plain' })` â†’ anchor click.

---

## 9. Business Flow Diagrams

### Generation Flow

```
User clicks "Generate Cover Letter"
â”‚
â”œâ”€ coverLetter exists? â†’ Show confirm dialog â†’ Cancel or Regenerate
â”‚
â–¼
doGenerate()
â”‚
â”œâ”€ 1. POST /api/cover-letter/extract-keywords
â”‚      â†’ progressStep = 'extracting'
â”‚      â†’ returns { matchedKeywords, missingKeywords }
â”‚      â†’ progressStep = 'keywords-ready' (badge preview shown)
â”‚      â†’ sleep(1200ms)
â”‚
â”œâ”€ 2. POST /api/cover-letter/generate
â”‚      â†’ progressStep = 'generating'
â”‚      â†’ AI writes letter
â”‚      â†’ DB upsert (content + generated_content = AI output)
â”‚      â†’ returns { coverLetter }
â”‚
â””â”€ 3. progressStep = 'done'
       â†’ coverLetter shown in textarea
       â†’ ATS badges computed client-side
```

### Save Flow

```
User edits textarea â†’ editableContent state
User clicks "Save Changes"
â”‚
â”œâ”€ PUT /api/cover-letter/:resumeId { content: editableContent }
â”‚    â†’ only content column updated; generated_content unchanged
â”‚
â””â”€ savedIndicator = true (2s) â†’ "Saved âœ“" feedback
```

### Resume Switch Flow (resumeId changes)

```
User picks different resume from dropdown
â”‚
â”œâ”€ selectedResumeId state updated
â”œâ”€ effectiveResumeId = selectedResumeId
â”œâ”€ useCoverLetter(effectiveResumeId) effect fires
â”‚    â†’ reset all state
â”‚    â†’ GET /api/cover-letter/:resumeId
â”‚         â†’ 404: no letter (valid) â†’ coverLetter stays null
â”‚         â†’ 200: load existing letter â†’ coverLetter populated
â””â”€ Right panel shows letter (or empty state)
```

---

## 10. Validation Rules

### Backend (express-validator â€” `server/src/routes/coverLetter/index.ts`)

**Extract keywords:**
- `resumeId`: UUID required
- `jobDescription`: string, not empty, max 5000

**Generate:**
- `resumeId`: UUID required
- `fullName`: string, not empty
- `targetRole`: string, not empty
- `targetLocation`: string, not empty
- `jobDescription`: string, not empty, max 5000
- `companyName`: string, not empty
- `tone`: one of `professional | enthusiastic | formal | conversational`
- `wordCountTarget`: one of `short | medium | long`
- `matchedKeywords`: optional, array
- `missingKeywords`: optional, array
- `hiringManagerName`: optional, string, trim, max 255
- `customInstructions`: optional, string, max 500

**Update:**
- `content`: string, not empty, max 10000

### Frontend constraints

| Field | Constraint | Where enforced |
|-------|-----------|---------------|
| Job description | `maxLength={5000}` HTML attr + char counter | `<textarea>` |
| Custom instructions | 500 char warning + button disabled | `isCustomInstructionsTooLong` state |
| Company name | Must not be empty | `isGenerateDisabled` check |
| Resume | Must be selected | `isGenerateDisabled` check |

---

## 11. Error Handling

### Backend pattern
All controllers use:
```typescript
try { ... } catch(err) { next(err) }
```
Global error handler in `server/src/middleware/errorHandler.ts` catches and formats responses.

### Frontend pattern (`useCoverLetter`)
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

Error state renders a red card with the message and a "Try again" button that calls `reset()` (â†’ `'idle'`).

Save errors set `error` state but do not change `progressStep`.

Initial load 404 is silently ignored (not an error â€” just means no letter exists yet).

---

## 12. Security

### Prompt Injection Sanitization (`server/src/utils/sanitizePromptInput.ts`)

All user-supplied text injected into AI prompts passes through `sanitizePromptInput()`:
- Strips null bytes and control chars (keeps `\n`, `\r`, `\t`)
- Replaces injection phrases with `[redacted]`:
  - `ignore (all) previous instructions`
  - `ignore (all) instructions`
  - `disregard (all) previous`
  - `you are now`
  - `new instructions`
  - `system:` / `assistant:` / `[system]` / `[assistant]` / `<< SYS >>`
- Truncates to 8000 chars

In `coverLetterGenerator.ts`:
- `jobDescription` â†’ sanitized then sliced to 2000
- `customInstructions` â†’ sanitized (no further slice beyond 500 backend limit)
- `resumeText` â†’ sliced to 3000 only (already from DB, not user-injected at call time)

### Rate Limiting

`aiLimiter` is applied per-route in `server/src/app.ts`:
```typescript
app.use('/api/cover-letter/extract-keywords', aiLimiter);
```
The `generate` endpoint also uses `aiLimiter`. Limit: 10 requests per 15 minutes per IP.

### Authentication
All cover letter routes require `isAuthenticated` middleware. Ownership is verified in every query by joining against `resumes.user_id = userId`. A user can never read or modify another user's cover letter.

---

## 13. Testing Patterns

### Backend (Jest + ts-jest + supertest)

Location: `server/src/controllers/__tests__/coverLetterController.test.ts`

**Mocks required:**
- `jest.mock('../../config/db')` â€” mock `pool.query`
- `jest.mock('../../services/ai/coverLetterGenerator')` â€” mock `generateCoverLetter`
- `jest.mock('../../services/ai/keywordExtractor')` â€” mock `extractKeywords`
- Passport session: set `req.user = { id: 'user-uuid' }` via test middleware

**Test suites:**
- `POST /extract-keywords`: 200 with `{ matchedKeywords, missingKeywords }`; 404 when resume not found; 400 when no resume content; 400 when resumeId is not a UUID; 400 when jobDescription is empty; 401 when unauthenticated
- `GET /` (listCoverLetters): 200 with `{ coverLetters: [...] }`; 200 with empty array; 401 when unauthenticated
- `POST /generate`: 201 with coverLetter; 404 when resume not found; 400 when validation fails; 401 when unauthenticated
- `GET /:resumeId`: 200; 404
- `PUT /:resumeId`: 200; 404; 400 when content missing
- `DELETE /:resumeId`: 200; 401

**Validation returns 400** (not 422) â€” express-validator's `validate` middleware uses `res.status(400)`.

**Validation test pattern:**
```typescript
const res = await request(app)
  .post('/api/cover-letter/extract-keywords')
  .send({ resumeId: 'not-a-uuid', jobDescription: '' });
expect(res.status).toBe(400);
```

**UUID format:** Backend validators require valid UUID v4 format â€” use real UUIDs in tests:
```typescript
const RESUME_ID = '11111111-1111-4111-8111-111111111111';
```

### Frontend (Vitest + @testing-library/react)

Location: `client/src/pages/__tests__/CoverLetterPage.test.tsx`

**Mocks required:**
- `vi.mock('../../utils/api')` â€” mock `listResumes`, `generateCoverLetter`, `getCoverLetter`, `saveCoverLetter`, `deleteCoverLetter`, `extractKeywords`, `apiClient`
- `vi.mock('../../hooks/useCoverLetter')` â€” mock entire hook; must return correct interface

**Correct `useCoverLetter` mock interface** (match `UseCoverLetterReturn` exactly):
```typescript
const defaultHookReturn = {
  coverLetter: null,
  keywords: { matched: [], missing: [] },
  progressStep: 'idle' as const,
  isLoading: false,
  isSaving: false,
  savedIndicator: false,
  error: null,
  generate: vi.fn(),
  save: vi.fn(),
  reset: vi.fn(),          // NOT clearError
};
```

**Route for renderPage:** `/cover-letter/new` (NOT `/resume/:id/cover-letter`)
```typescript
<MemoryRouter initialEntries={['/cover-letter/new']}>
  <Routes>
    <Route path="/cover-letter/new" element={<CoverLetterPage />} />
  </Routes>
</MemoryRouter>
```

**Key test patterns:**
- Use `vi.clearAllMocks()` in `beforeEach`
- Progress step tests: set `progressStep: 'extracting'` or `'generating'` in hook mock
- Error state tests: must set BOTH `progressStep: 'error'` AND `error: 'message'`
- `savedIndicator: true` shows "Saved âœ“" text inside the save button
- Button text: "Generate Cover Letter" (no letter), "â†º Regenerate" (letter exists), "Generating..." (in progress)
- For emoji assertions (âœ…/âŒ badges), use `getAllByText(/âœ…/, { selector: 'span' })`; set `keywords` in hook mock
- "Try again" button calls `reset()`, not `clearError()`