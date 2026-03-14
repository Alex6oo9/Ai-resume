# Cover Letter Feature — Current State

> Last updated: 2026-03-13 (post-migration 027)

---

## 1. Feature Overview

AI-powered cover letter generator with two entry points:

- `/cover-letter/new` — standalone mode with resume selector
- `/cover-letter/new?resumeId=<uuid>` — pre-selected resume (e.g. launched from Dashboard or ResumeAnalysisPage)

### Resume Input Modes
| Mode | Description |
|------|-------------|
| **Existing** | Pick from user's saved resumes in DB |
| **Upload PDF** | Parse PDF on-the-fly → ephemeral `resumeText`; no DB write |

### Key Characteristics
- **Multiple cover letters per resume** — no UNIQUE constraint (dropped migration 027); user can generate as many as they want
- **Letter list** — displayed as tab chips in the right panel; clicking a chip switches `activeLetter`
- **Progress UI** — 3-step: extract keywords → pause (badge preview) → generate
- **Revert** — `generated_content` is frozen at generation time; `content` is the mutable editor copy
- **Temporary letters** — when no saved resume is selected (upload mode or no `resumeId`); generated, shown in editor, not persisted to DB

---

## 2. Database Schema (current)

```sql
CREATE TABLE cover_letters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id             UUID REFERENCES resumes(id) ON DELETE CASCADE,  -- nullable for temporary
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content               TEXT NOT NULL,
  generated_content     TEXT NOT NULL,
  tone                  VARCHAR(50) NOT NULL DEFAULT 'professional',
  word_count_target     VARCHAR(20) NOT NULL DEFAULT 'medium',
  company_name          VARCHAR(255),
  hiring_manager_name   VARCHAR(255),
  job_title             VARCHAR(255),          -- added migration 027
  custom_instructions   TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- NO UNIQUE constraint (dropped migration 027)
);
CREATE INDEX idx_cover_letters_resume_created ON cover_letters(resume_id, created_at DESC);
CREATE INDEX idx_cover_letters_user_id ON cover_letters(user_id);
```

### Migrations
| Migration | Change |
|-----------|--------|
| 022 | Create `cover_letters` table with `UNIQUE(resume_id)` |
| 027 | Drop `UNIQUE(resume_id)`, add `job_title VARCHAR(255)`, reindex to `idx_cover_letters_resume_created` |

---

## 3. TypeScript Types (current)

### Client `CoverLetter` interface

```typescript
export interface CoverLetter {
  id: string | null;               // null for temporary letters
  resume_id: string | null;        // null for temporary letters
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  job_title: string | null;              // NEW (migration 027)
  resume_target_role?: string;           // from JOIN in listCoverLettersByResume
  custom_instructions: string | null;
  isTemporary?: boolean;                 // NEW — client-side flag (not persisted)
  created_at: string;
  updated_at: string;
}

export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';
```

### `GenerateCoverLetterPayload`

`resumeId` and `resumeText` are both optional — at least one must be provided (server validates):

```typescript
export interface GenerateCoverLetterPayload {
  resumeId?: string;               // UUID of saved resume (omit for temporary)
  resumeText?: string;             // raw text (upload mode, ephemeral)
  fullName: string;
  targetRole?: string;
  targetLocation?: string;
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
```

---

## 4. API Endpoints (current)

All routes under `/api/cover-letter`. All require `isAuthenticated` middleware.

```
POST   /extract-keywords        → extractKeywords           (aiLimiter)
GET    /                        → listCoverLetters           (all user's, limit 10)
POST   /generate                → generateCoverLetter        (aiLimiter)
GET    /resume/:resumeId        → listCoverLettersByResume
GET    /:id                     → getCoverLetter             (by letter UUID)
PUT    /:id                     → updateCoverLetter          (save edits)
DELETE /:id                     → deleteCoverLetter
POST   /:id/regenerate          → regenerateCoverLetter      (aiLimiter)
POST   /:id/improve             → improveCoverLetter         (aiLimiter)
```

> **Note:** CRUD routes use `/:id` (the letter's UUID), NOT `/:resumeId`.

---

### `POST /extract-keywords`

Accepts `resumeId` (UUID) OR `resumeText` (string) — not both required.

**Request:**
```json
{
  "resumeId": "uuid-of-saved-resume",
  "jobDescription": "We are looking for..."
}
```
OR
```json
{
  "resumeText": "John Doe\nSoftware Engineer\n...",
  "jobDescription": "We are looking for..."
}
```

**Response `200`:**
```json
{
  "matchedKeywords": ["React", "TypeScript"],
  "missingKeywords": ["Kubernetes", "GraphQL"]
}
```

---

### `POST /generate`

`resumeId` is optional — omit for a temporary letter (no DB write).

**Request:**
```json
{
  "resumeId": "uuid",
  "fullName": "Jane Doe",
  "jobDescription": "...",
  "companyName": "Acme Corp",
  "jobTitle": "Frontend Engineer",
  "tone": "professional",
  "wordCountTarget": "medium",
  "matchedKeywords": ["React"],
  "missingKeywords": ["GraphQL"],
  "customInstructions": "Mention my open-source work."
}
```

**Response `201`** (persisted — resumeId provided):
```json
{
  "coverLetter": {
    "id": "uuid",
    "resume_id": "uuid",
    "content": "...",
    "generated_content": "...",
    "job_title": "Frontend Engineer",
    "..."
  }
}
```

**Response `200`** (temporary — no resumeId):
```json
{
  "coverLetter": {
    "id": null,
    "resume_id": null,
    "isTemporary": true,
    "content": "...",
    "generated_content": "...",
    "..."
  }
}
```

- **No upsert** — always INSERTs a new row (no `ON CONFLICT`)
- Temporary response: nothing written to DB

---

### `GET /resume/:resumeId`

Returns all cover letters for one resume, ordered by `updated_at DESC`.

**Response `200`:**
```json
{
  "coverLetters": [
    {
      "id": "uuid",
      "resume_id": "uuid",
      "resume_target_role": "Software Engineer",
      "job_title": "Frontend Engineer",
      "company_name": "Acme",
      "tone": "professional",
      "content": "...",
      "generated_content": "...",
      "created_at": "...",
      "updated_at": "..."
    }
  ]
}
```

---

### `GET /:id`

Returns a single cover letter by its UUID.

---

### `PUT /:id`

Saves user edits to `content` only. `generated_content` is never changed by this endpoint.

**Request:**
```json
{ "content": "Edited cover letter text..." }
```

---

### `DELETE /:id`

Permanently deletes the cover letter.

---

### `POST /:id/regenerate`

Re-runs AI generation for an existing letter. Updates both `content` AND `generated_content`.

**Request:**
```json
{
  "fullName": "Jane Doe",
  "jobDescription": "...",
  "companyName": "Acme",
  "tone": "enthusiastic",
  "wordCountTarget": "long"
}
```

**Response `200`:**
```json
{ "coverLetter": { "...updatedRecord": true } }
```

---

### `POST /:id/improve`

Personalises the letter by weaving user-provided stories into `generated_content`. Updates both `content` and `generated_content`.

**Request:**
```json
{
  "whyThisCompany": "I admire Acme's commitment to sustainability.",
  "achievementToHighlight": "Led a team that reduced load time by 40%."
}
```
At least one field required (controller enforces).

**Response `200`:**
```json
{ "coverLetter": { "...updatedRecord": true } }
```

---

## 5. Business Rules

| Rule | Detail |
|------|--------|
| **Multiple per resume** | No UNIQUE constraint; unlimited letters per resume |
| **Revert** | `generated_content` frozen at generation/regeneration time; `content` is editable; revert sets editor back to `generated_content` |
| **Keyword coverage** | Computed client-side: `editorHtml.toLowerCase().includes(keyword.toLowerCase())` — no server round-trip |
| **Temporary letters** | Generated when no `resumeId` provided (upload mode or standalone with no resume); shown in editor but not persisted; "Save" disabled |
| **Improve** | Based on `generated_content`, not current edits; if user has unsaved edits a confirm dialog is shown first |
| **Rate limit** | `aiLimiter`: 10 req/15 min per IP on `/extract-keywords`, `/generate`, `/:id/regenerate`, `/:id/improve` |

---

## 6. Business Flows

### Create flow

```
1. User fills form → POST /extract-keywords
   → progressStep = 'extracting'
   → response: matchedKeywords, missingKeywords

2. sleep(1200ms) → progressStep = 'keywords-ready'
   (badge preview shown to user)

3. POST /generate
   → progressStep = 'generating'
   → response: coverLetter

4. progressStep = 'done'
   → activeLetter set to new letter
   → letter prepended to coverLetters list
```

### Regenerate flow

```
1. User clicks ↺ Regenerate → confirm dialog (warn: overwrites current)
2. POST /:id/regenerate → progressStep = 'generating'
3. Response: content + generated_content both replaced
4. activeLetter updated in list
```

### Improve flow

```
1. User fills "Why this company?" and/or "Achievement to highlight"
2. If unsaved edits → confirm dialog
3. POST /:id/improve → progressStep = 'generating'
4. AI weaves personalisations into generated_content
5. Both content + generated_content updated in DB and list
```

### Letter list / resume switch

```
selectedResumeId changes
→ useCoverLetters effect fires
→ GET /resume/:resumeId
→ coverLetters array loaded
→ activeLetter = first letter in list (if any), else null
```

---

## 7. Frontend Hook — `useCoverLetters`

**File:** `client/src/hooks/useCoverLetters.ts`

Replaces the old `useCoverLetter` (singular) hook.

### State

| State field | Type | Description |
|-------------|------|-------------|
| `coverLetters` | `CoverLetter[]` | All letters for current resume |
| `activeLetter` | `CoverLetter \| null` | Currently selected / editing letter |
| `mode` | `'new' \| 'edit'` | UI mode |
| `keywords` | `{ matched: string[], missing: string[] }` | From extract-keywords |
| `progressStep` | `'idle' \| 'extracting' \| 'keywords-ready' \| 'generating' \| 'done' \| 'error'` | Progress state |
| `isLoading` | `boolean` | API call in-flight |
| `isSaving` | `boolean` | Save call in-flight |
| `savedIndicator` | `boolean` | Briefly true after successful save |
| `error` | `string \| null` | Last error message |
| `resumeInputMode` | `'existing' \| 'upload'` | How resume text is sourced |
| `uploadedResumeText` | `string` | Parsed text from uploaded PDF |
| `uploadedFileName` | `string` | Display name of uploaded file |
| `isParsing` | `boolean` | PDF parse in-flight |
| `parseError` | `string \| null` | PDF parse error |
| `isTemporaryLetter` | `boolean` | True when active letter has no DB record |

### Methods

| Method | Purpose |
|--------|---------|
| `create(payload)` | extract-keywords → generate → prepend to list, set activeLetter |
| `regenerate(letterId, payload)` | `POST /:id/regenerate` → update letter in list |
| `save(content)` | `PUT /:id` → update `content` in list |
| `remove(letterId)` | `DELETE /:id` → remove from list; reset activeLetter if it was active |
| `improve(letterId, why?, achievement?)` | `POST /:id/improve` → update letter in list |
| `startNew()` | Reset `activeLetter` to null, `mode` to `'new'` |
| `selectLetter(letter)` | Set `activeLetter`, `mode` to `'edit'` |
| `parseUploadedFile(file)` | `POST /resume/parse-text` → set `uploadedResumeText` |
| `reset()` | `progressStep = 'idle'`, clear error |

---

## 8. Validation Rules

### `POST /extract-keywords`
- `resumeId` (UUID v4) OR `resumeText` (non-empty string) — one required
- `jobDescription` — required, max 5000 chars

### `POST /generate`
- `fullName` — required
- `jobDescription` — required, max 5000 chars
- `companyName` — required
- `tone` — required, one of: `professional | enthusiastic | formal | conversational`
- `wordCountTarget` — required, one of: `short | medium | long`
- `resumeId` — optional UUID v4
- `resumeText` — optional string
- `jobTitle` — optional, max 255 chars
- `customInstructions` — optional, max 500 chars

### `POST /:id/regenerate`
- Same as `/generate` minus `resumeId` / `resumeText`

### `POST /:id/improve`
- `whyThisCompany` — optional, max 300 chars
- `achievementToHighlight` — optional, max 200 chars
- At least one of the two fields required (controller-level check)

### `PUT /:id`
- `content` — required, max 10000 chars

---

## 9. Key Files

| File | Purpose |
|------|---------|
| `server/src/controllers/coverLetterController.ts` | All route handlers |
| `server/src/routes/coverLetter/index.ts` | Route definitions + middleware |
| `server/src/services/ai/coverLetterGenerator.ts` | GPT-4o-mini generation |
| `server/src/services/ai/keywordExtractor.ts` | GPT-4o-mini keyword extraction |
| `server/src/types/coverLetter.types.ts` | Server-side types |
| `server/src/migrations/022_create_cover_letters.ts` | Initial table |
| `server/src/migrations/027_alter_cover_letters_multiple.ts` | Drop UNIQUE, add job_title |
| `client/src/hooks/useCoverLetters.ts` | Main frontend hook (replaces useCoverLetter) |
| `client/src/pages/CoverLetterPage.tsx` | Main page component |
| `client/src/types/index.ts` | Client-side `CoverLetter` interface |
