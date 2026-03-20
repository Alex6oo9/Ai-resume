

***

# Multiple Cover Letters Per Resume — Implementation Brief for Claude Code

## Overview

Currently, the `cover_letters` table has a `UNIQUE(resume_id)` constraint that limits users to one cover letter per resume. Every new generation overwrites the previous one. This change removes that constraint and allows unlimited cover letters per resume — each targeting a different company and job title. Every GET, PUT, and DELETE endpoint changes from using `resumeId` as the identifier to using the cover letter's own `id` UUID. This is a breaking change that must be applied consistently across the entire stack.

***

## Stack & Patterns to Follow

- **Backend:** Node.js + Express 4 + TypeScript, PostgreSQL raw `pg` pool, `isAuthenticated` middleware, user ID via `(req.user as any).id`, express-validator for all validation, errors shaped as `{ message: string, errors?: object }`, all 400 (not 422)
- **Frontend:** React 18 + TypeScript + TailwindCSS, axios with `baseURL: '/api'` and `withCredentials: true` — all paths are relative WITHOUT `/api` prefix
- **Testing:** Jest + ts-jest + supertest (backend), Vitest + Testing Library (frontend)
- **TDD:** Write failing tests first, then implement until they pass

***

## Part 1 — Database Migration `023`

### File: `server/src/migrations/023_alter_cover_letters_multiple.ts`

Apply the following changes to the existing `cover_letters` table:

1. **Drop the unique constraint** on `resume_id`. The constraint name is `cover_letters_resume_id_key` (standard PostgreSQL naming for `UNIQUE(resume_id)` added in migration 022).

2. **Add column `job_title`** — `VARCHAR(255)`, nullable. This stores the specific role the user is applying for at that company (e.g., "Frontend Developer"). This differs from the resume's `target_role` because a user may have one general resume but apply for slightly different roles at different companies. Nullable for backward compatibility with letters that already exist before this migration.

3. **Drop the old index** `idx_cover_letters_resume_id` and replace it with a composite index `idx_cover_letters_resume_created` on `(resume_id, created_at DESC)` for efficient listing of all letters per resume ordered by most recent.

4. **Keep** the `idx_cover_letters_user_id` index unchanged.

5. The migration must be wrapped in a transaction so it is fully atomic. Wire it into the existing numbered migration runner as migration 023.

**Important:** Existing rows in `cover_letters` remain valid after the migration. The constraint drop and column addition are non-destructive to existing data.

***

## Part 2 — TypeScript Type Changes

### Server: `server/src/types/coverLetter.types.ts`

Add `job_title: string | null` to `CoverLetterRecord`. Add `jobTitle?: string` (optional) to `GenerateCoverLetterRequest`. Remove any comments referencing "upsert" behavior.

### Client: `client/src/types/index.ts`

Add `job_title: string | null` to the `CoverLetter` interface. All other existing fields remain the same.

***

## Part 3 — Backend Controller Changes

### File: `server/src/controllers/coverLetterController.ts`

#### `generateCoverLetter` handler — CHANGED

Previously this used `INSERT ... ON CONFLICT (resume_id) DO UPDATE` (upsert). **Remove the upsert entirely.** The handler now always performs a plain `INSERT`. Every call to this endpoint creates a new row. Accept the optional `jobTitle` field from the request body and store it in the `job_title` column (null if not provided).

Validation additions: `jobTitle` is optional, string, max 255 chars.

Response remains `201 { coverLetter: CoverLetterRecord }`.

#### `getCoverLetter` handler — CHANGED

Previously: `GET /api/cover-letter/:resumeId` — queried `WHERE cl.resume_id = $1 AND r.user_id = $2`.

Now: `GET /api/cover-letter/:id` — queries `WHERE cl.id = $1 AND r.user_id = $2` (joins `cover_letters` to `resumes` to verify ownership via `user_id`). The `:id` param is the cover letter's own UUID.

#### `updateCoverLetter` handler — CHANGED

Previously: `PUT /api/cover-letter/:resumeId`. Now: `PUT /api/cover-letter/:id`. Query uses `WHERE cl.id = $1 AND r.user_id = $2`. Only updates `content` and `updated_at`, never `generated_content`. Same validation: content 1–10000 chars.

#### `deleteCoverLetter` handler — CHANGED

Previously: `DELETE /api/cover-letter/:resumeId`. Now: `DELETE /api/cover-letter/:id`. Query uses `WHERE cl.id = $1 AND r.user_id = $2`.

#### `listCoverLettersByResume` handler — NEW

Fetches all cover letters for a specific resume, ordered by `updated_at DESC`. Ownership verified via JOIN to `resumes`. Returns `200 { coverLetters: CoverLetterRecord[] }` — an array, never 404 (empty array is valid). No limit — return all letters for the resume.

SQL pattern:
```
SELECT cl.*, r.target_role as resume_target_role
FROM cover_letters cl
JOIN resumes r ON cl.resume_id = r.id
WHERE cl.resume_id = $1 AND r.user_id = $2
ORDER BY cl.updated_at DESC
```

Including `resume_target_role` in the response so the client can display it alongside the letter's own `job_title`.

#### `regenerateCoverLetter` handler — NEW

`POST /api/cover-letter/:id/regenerate`

This endpoint re-runs the AI generation for a specific existing letter, updating BOTH `content` AND `generated_content` on that row. It replaces the AI output for that specific cover letter without creating a new one. Accepts the same request body as `generateCoverLetter` (all generation params). Validates ownership via `WHERE cl.id = $1 AND r.user_id = $2`. On success returns `200 { coverLetter: CoverLetterRecord }`.

Rate limited by `aiLimiter` (same as generate).

#### `listCoverLetters` handler — UNCHANGED

The existing `GET /api/cover-letter/` endpoint that returns the user's most recent 10 letters across all resumes stays as-is. No changes needed here.

#### `extractKeywords` handler — UNCHANGED

No changes.

***

## Part 4 — Route Changes

### File: `server/src/routes/coverLetter/index.ts`

```
POST   /extract-keywords         → extractKeywords handler          [isAuthenticated, aiLimiter]
POST   /generate                 → generateCoverLetter handler       [isAuthenticated, aiLimiter]
GET    /                         → listCoverLetters handler          [isAuthenticated]
GET    /resume/:resumeId         → listCoverLettersByResume handler  [isAuthenticated]   ← NEW
GET    /:id                      → getCoverLetter handler            [isAuthenticated]
PUT    /:id                      → updateCoverLetter handler         [isAuthenticated]
DELETE /:id                      → deleteCoverLetter handler         [isAuthenticated]
POST   /:id/regenerate           → regenerateCoverLetter handler     [isAuthenticated, aiLimiter]  ← NEW
```

⚠️ **Critical route ordering in Express:** Static path segments must be registered before dynamic ones. The order above must be maintained exactly. `POST /extract-keywords` and `GET /resume/:resumeId` must appear before `GET /:id`, otherwise Express will match `resume` and `extract-keywords` as `:id` values, causing incorrect routing. Always register routes with static segments first.

***

## Part 5 — Frontend API Utility Changes

### File: `client/src/utils/api.ts`

Update the following existing functions:

- `getCoverLetter(resumeId)` → rename to `getCoverLetter(letterId: string)` and change URL from `/cover-letter/${resumeId}` to `/cover-letter/${letterId}`
- `saveCoverLetter(resumeId, content)` → rename to `saveCoverLetter(letterId: string, content: string)` and change URL to `/cover-letter/${letterId}`
- `deleteCoverLetter(resumeId)` → rename to `deleteCoverLetter(letterId: string)` and change URL to `/cover-letter/${letterId}`

Add the following new functions:
- `listCoverLettersByResume(resumeId: string)` → GET `/cover-letter/resume/${resumeId}`, returns `{ coverLetters: CoverLetter[] }`
- `regenerateCoverLetter(letterId: string, payload: GenerateCoverLetterPayload)` → POST `/cover-letter/${letterId}/regenerate`, returns `{ coverLetter: CoverLetter }`

The `generateCoverLetter(payload)` function stays the same URL but the payload interface now optionally includes `jobTitle?: string`.

***

## Part 6 — Frontend Hook: Replace `useCoverLetter` with `useCoverLetters`

### File: `client/src/hooks/useCoverLetters.ts` (rename/replace from `useCoverLetter.ts`)

This hook now manages a list of letters for the given `resumeId` and tracks which one is currently active (being viewed or edited).

#### State managed

- `coverLetters: CoverLetter[]` — all letters for the current resume, ordered by `updated_at DESC`
- `activeLetter: CoverLetter | null` — the letter currently shown in the editor
- `mode: 'new' | 'edit'` — `'new'` when the user is filling the form to create a new letter; `'edit'` when an existing letter is selected and open in the editor
- `keywords: { matched: string[], missing: string[] }` — from the latest extract-keywords call; persists after generation for the badge panel
- `progressStep: ProgressStep` — `'idle' | 'extracting' | 'keywords-ready' | 'generating' | 'done' | 'error'`
- `isLoading: boolean` — true during the initial `listCoverLettersByResume` fetch on mount
- `isSaving: boolean` — true during `saveCoverLetter` API call
- `savedIndicator: boolean` — true for 2000ms after a successful save (for "Saved ✓" UI feedback)
- `error: string | null`

#### `useEffect` on `resumeId`

On every `resumeId` change: reset all state. Call `listCoverLettersByResume(resumeId)`. If the response contains letters, set `coverLetters` to the result, set `activeLetter` to the first one in the list, and set `mode` to `'edit'`. If the response is an empty array, set `coverLetters` to `[]`, `activeLetter` to `null`, and `mode` to `'new'`. Use an `AbortController` or `cancelled` flag to prevent state updates after unmount (same pattern as `useAuth`). A 404 from the API should never happen (server returns empty array, not 404), but if it does, treat it as empty array.

#### `startNew()` function

Resets `activeLetter` to `null`, sets `mode` to `'new'`, resets `progressStep` to `'idle'`, resets `keywords` to `{ matched: [], missing: [] }`, and clears `error`. Does NOT clear `coverLetters` — the existing list stays visible.

#### `selectLetter(letter: CoverLetter)` function

Sets `activeLetter` to the given letter, sets `mode` to `'edit'`, resets `progressStep` to `'idle'`, and clears `error`. The form on the left panel should reactively update to show that letter's metadata.

#### `create(payload: GenerateCoverLetterPayload)` function

This is the `generate` flow for creating a NEW letter (mode = `'new'`):

1. Set `progressStep` to `'extracting'`
2. Call `extractKeywordsApi(payload.resumeId, payload.jobDescription)` — awaits response
3. Set `keywords` with the returned `{ matched, missing }`. Set `progressStep` to `'keywords-ready'`
4. Wait 1200ms (so the user sees the keyword preview)
5. Set `progressStep` to `'generating'`
6. Call `generateCoverLetterApi({ ...payload, matchedKeywords, missingKeywords })` — awaits response
7. On success: prepend the new letter to `coverLetters`, set it as `activeLetter`, set `mode` to `'edit'`, set `progressStep` to `'done'`
8. On any error: set `progressStep` to `'error'`, set `error` message

#### `regenerate(letterId: string, payload: GenerateCoverLetterPayload)` function

This is the re-generate flow for an EXISTING letter (mode = `'edit'`). Same 3-step progress as `create`, but calls `regenerateCoverLetterApi(letterId, { ...payload, matchedKeywords, missingKeywords })` in step 3 instead of `generateCoverLetterApi`. On success: update the matching letter in `coverLetters` array and update `activeLetter` with the new content.

#### `save(content: string)` function

Calls `saveCoverLetterApi(activeLetter.id, content)`. On success: update `activeLetter.content` and the matching letter in `coverLetters`. Set `savedIndicator` to `true` for 2000ms. On error: set `error`.

#### `remove(letterId: string)` function

Calls `deleteCoverLetterApi(letterId)`. On success: remove the letter from `coverLetters`. If `activeLetter.id === letterId`, set `activeLetter` to the next letter in the list, or to `null` if the list is now empty. If no letters remain, switch `mode` to `'new'`.

#### `reset()` function

Sets `progressStep` to `'idle'`, clears `error`. Does not change `activeLetter` or `coverLetters`.

#### Hook return interface `UseCoverLettersReturn`

```
coverLetters, activeLetter, mode, keywords,
progressStep, isLoading, isSaving, savedIndicator, error,
startNew, selectLetter, create, regenerate, save, remove, reset
```

***

## Part 7 — Frontend Page Changes

### File: `client/src/pages/CoverLetterPage.tsx`

The page layout remains two panels (left form, right output). The right panel gains a new section at the top — the letters list.

#### Left panel — Form

The form stays identical to the current implementation with one addition: a **Job Title** field between Company Name and Hiring Manager.

| Field | Required | Notes |
|---|---|---|
| Resume selector | Yes | Dropdown from `GET /resume` |
| Full Name | No | Pre-fills from auth user |
| Target Role | No | User fills manually |
| Target Location | No | User fills manually |
| Job Description | **Yes** | maxLength 5000, char counter |
| Company Name | **Yes** | maxLength 255 |
| Job Title | No | New field, maxLength 255 — stores the specific role at this company |
| Hiring Manager | No | maxLength 255 |
| Tone | Yes | Default Professional |
| Length | Yes | Default Medium |
| Custom Instructions | No | max 500, char counter |

When `activeLetter` changes (user selects a different letter), the form fields should update to reflect that letter's stored values: `company_name → companyName`, `hiring_manager_name → hiringManagerName`, `job_title → jobTitle`, `tone`, `word_count_target → wordCountTarget`, `custom_instructions → customInstructions`. Fields that are not stored on the letter (`targetRole`, `targetLocation`, `fullName`, `jobDescription`) do NOT get overwritten when switching letters — those are generation-time inputs only.

**Generate button behavior:**
- When `mode === 'new'`: button label is "Generate Cover Letter". On click, calls `create(payload)`.
- When `mode === 'edit'`: button label is "↺ Regenerate". On click, shows a confirm modal ("This will replace the AI output for this letter. Continue?"). On confirm, calls `regenerate(activeLetter.id, payload)`.
- Button is disabled when: no resume selected, `jobDescription` is empty, `companyName` is empty, `customInstructions.length > 500`, or any progress step is active (extracting / keywords-ready / generating).

#### Right panel — Letters list section

Shown only when `coverLetters.length > 0`. Rendered as a horizontal scrollable row of compact cards or a small stacked list above the editor area. Each card/row shows:
- Company name (bold)
- Job title if present, otherwise the resume's `target_role`, otherwise "Cover Letter"
- `updated_at` formatted as relative time (e.g., "2 days ago")
- A "Delete" button (icon button, small) — calls `remove(letter.id)` with a confirm dialog: "Delete this cover letter for [company name]?"
- Clicking the card (not the delete button) calls `selectLetter(letter)` and highlights it as active

At the start of the list, always show a **"+ New Cover Letter"** button/card. Clicking it calls `startNew()`, which clears the editor and resets the form to empty state.

The active letter should be visually highlighted (e.g., border or background color change) so the user always knows which one they're editing.

#### Right panel — Editor area (unchanged behavior)

The editor area renders the same three states as currently implemented:
- Loading spinner while `isLoading` is true
- Empty state ("Your cover letter will appear here") when `activeLetter === null` and no progress is running
- 3-step progress bar while any progress step is active
- Letter editor when `activeLetter !== null` and `progressStep === 'idle' | 'done' | 'error'`

The letter editor contents (textarea, word count, revert link, ATS keyword badges, action bar with Save / Download PDF / Download TXT) remain identical to the current implementation. The only change: "Revert to AI original" compares `editableContent !== activeLetter.generated_content`, which was already the behavior.

**Error card:** Shows when `progressStep === 'error'`. "Try again" button calls `reset()`.

**`editableContent` local state:** On every `activeLetter` change, reset `editableContent` to `activeLetter.content`. This ensures the textarea always reflects the selected letter.

**Save behavior:** Save button is labeled "Save Changes". Disabled when `isSaving` or when `editableContent` is unchanged from `activeLetter.content`. After successful save, shows "Saved ✓" for 2 seconds.

#### Route update

The current client route is `/resume/:id/cover-letter`. This stays as-is. The page reads `resumeId` from params, passes it to `useCoverLetters(resumeId)`.

The standalone route `/cover-letter/new` also stays. In standalone mode, `resumeId` starts undefined; the hook is initialized with `undefined` and the letters list is empty until the user selects a resume from the dropdown.

***

## Part 8 — Tests

### Backend: `server/src/controllers/__tests__/coverLetterController.test.ts`

Completely rewrite affected test cases to use `letterId` instead of `resumeId` for GET/PUT/DELETE. Add new test suites.

**Test constants — use real UUID v4 format:**
```
RESUME_ID = '11111111-1111-4111-8111-111111111111'
LETTER_ID  = '22222222-2222-4222-8222-222222222222'
USER_ID    = '33333333-3333-4333-8333-333333333333'
```

**`POST /generate` tests:**
- 201 creates a new letter (no upsert, always INSERT)
- 201 accepts optional `jobTitle` and stores it
- Two sequential POST /generate calls for the same resumeId now create two separate rows (NOT an overwrite)
- 404 when resume not found or not owned
- 400 when resumeId is not a UUID
- 400 when jobDescription is empty
- 400 when companyName is empty
- 401 when unauthenticated

**`GET /resume/:resumeId` tests (NEW suite):**
- 200 with `{ coverLetters: [] }` when no letters exist for this resume
- 200 with array of letters ordered by `updated_at DESC`
- 401 when unauthenticated
- 404 when resume not found or not owned (server returns 404 for the resume, not the letters)

**`GET /:id` tests — CHANGED (was `GET /:resumeId`):**
- 200 with letter when found and owned
- 404 when letter not found
- 404 when letter exists but belongs to different user
- 401 when unauthenticated

**`PUT /:id` tests — CHANGED (was `PUT /:resumeId`):**
- 200 updates only `content`
- `generated_content` is unchanged after PUT
- 400 when content is empty
- 400 when content exceeds 10000 chars
- 404 when letter not found
- 401 when unauthenticated

**`DELETE /:id` tests — CHANGED (was `DELETE /:resumeId`):**
- 200 on successful delete
- 404 when letter not found
- 401 when unauthenticated

**`POST /:id/regenerate` tests (NEW suite):**
- 200 updates BOTH `content` AND `generated_content`
- 404 when letter not found or not owned
- 400 on validation failure
- 401 when unauthenticated
- Rate limited (apply same aiLimiter)

### Frontend: `client/src/pages/__tests__/CoverLetterPage.test.tsx`

Update the mock of `useCoverLetter` → `useCoverLetters` (new hook name). Update the default mock return value to match `UseCoverLettersReturn`:

```typescript
const defaultHookReturn = {
  coverLetters: [],
  activeLetter: null,
  mode: 'new' as const,
  keywords: { matched: [], missing: [] },
  progressStep: 'idle' as const,
  isLoading: false,
  isSaving: false,
  savedIndicator: false,
  error: null,
  startNew: vi.fn(),
  selectLetter: vi.fn(),
  create: vi.fn(),
  regenerate: vi.fn(),
  save: vi.fn(),
  remove: vi.fn(),
  reset: vi.fn(),
};
```

Add new test cases:
- Letters list renders when `coverLetters.length > 0`
- Clicking a letter card calls `selectLetter(letter)`
- Clicking "+ New Cover Letter" calls `startNew()`
- Delete button on a letter card shows confirm dialog, then calls `remove(letter.id)`
- When `mode === 'new'`, generate button says "Generate Cover Letter" and calls `create`
- When `mode === 'edit'`, generate button says "↺ Regenerate", confirm modal appears, then calls `regenerate`
- Job Title field is present in the form
- Active letter card is visually distinguished from inactive ones

***

## Part 9 — What to Watch Out For

**1. Express route ordering is critical.**
`GET /resume/:resumeId` must be registered BEFORE `GET /:id`. If `/:id` is first, Express will match `resume` as a UUID and pass it to `getCoverLetter`, which will fail with a validation error or 404. Always register static-segment routes before dynamic-segment routes.

**2. The `ON CONFLICT` upsert is completely removed.**
The `generate` controller must use a plain `INSERT` statement. Do not leave any trace of `ON CONFLICT (resume_id) DO UPDATE` in the generate handler. The only endpoint that updates `generated_content` is now `POST /:id/regenerate`.

**3. Ownership verification changes.**
Previously, all queries verified ownership via `WHERE cl.resume_id = $1 AND r.user_id = $2`. Now, GET/PUT/DELETE/regenerate verify via `WHERE cl.id = $1 AND r.user_id = $2` (joining cover_letters → resumes to check the user_id). The `listCoverLettersByResume` endpoint still uses `WHERE cl.resume_id = $1 AND r.user_id = $2`.

**4. `editableContent` must reset on `activeLetter` change.**
In `CoverLetterPage`, `editableContent` is a local `useState`. Wrap a `useEffect` on `activeLetter?.id` that resets `editableContent` to `activeLetter?.content ?? ''`. Without this, switching between letters will show stale content in the editor.

**5. The delete flow must handle "deleting the active letter."**
In the `remove` function inside the hook: if `activeLetter?.id === letterId`, after removing from the array, set `activeLetter` to `coverLetters[0]` (first remaining letter after deletion) or `null` if none remain. If `null`, switch `mode` to `'new'`. Without this, the editor will keep showing a deleted letter's content.

**6. Backward compatibility with existing letters.**
Existing cover_letters rows have `job_title = NULL`. The frontend must handle `job_title: null` gracefully — display the resume's `target_role` as a fallback label in the list. The `job_title` field on the form starts empty; the user is not forced to fill it.

**7. The `UNIQUE(resume_id)` constraint name.**
PostgreSQL names the constraint `cover_letters_resume_id_key` by default when using `UNIQUE(resume_id)` in a `CREATE TABLE` statement. The migration must drop it by this exact name: `ALTER TABLE cover_letters DROP CONSTRAINT cover_letters_resume_id_key`. If for any reason the constraint was named differently, Claude Code must check the actual constraint name in the database before running the migration.

**8. Migration runner.**
Follow the existing numbered migration runner pattern exactly. The file should be `023_alter_cover_letters_multiple.ts`. Do not create a new SQL file if the existing pattern uses `.ts` migration files with SQL executed via `pool.query`. Check migration 022 for the correct pattern to follow.

**9. Update SERVER.md and CLIENT.md.**
After implementation, update the Cover Letter section in both documentation files to reflect:
- The new `job_title` field
- The route changes (`:resumeId` → `:id` for GET/PUT/DELETE)
- The new `GET /cover-letter/resume/:resumeId` list endpoint
- The new `POST /cover-letter/:id/regenerate` endpoint
- The removal of upsert behavior in generate