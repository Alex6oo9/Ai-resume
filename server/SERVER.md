# Server Documentation (For Client Reference)

## Overview
Node.js + Express 4 + TypeScript REST API with PostgreSQL and session-based authentication.

## API Base Path
All endpoints prefixed with `/api`. Client should configure `axios.baseURL = '/api'` and use relative paths.

## Authentication & Sessions

- `express-session` with PostgreSQL session store
- HTTP-only cookies, cookie name: `connect.sid`
- Client must send `withCredentials: true`
- Protected routes attach `req.user: { id: string, email: string, name: string }`

---

## API Endpoints

### Health Check

#### `GET /api/health`
Returns server and database health. No authentication required.
```json
// Response 200
{
  "status": "healthy",
  "timestamp": "2026-03-18T10:00:00.000Z",
  "checks": {
    "api": "ok",
    "db": { "status": "ok", "latencyMs": 4 }
  }
}
// status is "degraded" if DB check fails; db.status is "degraded" with latencyMs: null
```
`Cache-Control: no-cache`. Used by `ConnectivityProvider` (client) for automatic server-down detection.

---

### Authentication (`/api/auth/*`)

#### `POST /api/auth/register`
```json
// Request
{ "name": "string (optional)", "email": "string", "password": "string (min 8 chars)" }
// Response 201 — does NOT auto-login; user must verify email first
{ "message": "Account created. Please check your email to verify your account." }
// Errors: 409 (email exists), 400 (validation)
```

#### `POST /api/auth/login`
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "user": { "id": "uuid", "email": "string", "name": "string" } }
// 401 — invalid credentials
// 403 — email not verified: { "error": "Please verify your email before logging in.", "email": "user@example.com" }
```

#### `POST /api/auth/logout`
Auth required. Destroys session. Response: `{ "message": "Logged out successfully" }`

#### `GET /api/auth/me`
Auth required. Returns current user or 401.

#### `GET /api/auth/verify-email?token=<hex>`
Verifies email using token from email link.
```json
// Response 200
{ "message": "Email verified successfully. You can now log in." }
// 400 — invalid or expired token
```

#### `POST /api/auth/resend-verification`
```json
// Request
{ "email": "string" }
// Response 200 (always same message to prevent email enumeration)
{ "message": "If an account exists with that email, a verification link has been sent." }
```

#### `POST /api/auth/forgot-password`
Rate limited: 5 requests/hour.
```json
// Request
{ "email": "string" }
// Response 200 (always same message)
{ "message": "If an account exists with that email, a password reset link has been sent." }
```

#### `POST /api/auth/reset-password`
```json
// Request
{ "token": "string", "password": "string (min 8 chars)" }
// Response 200
{ "message": "Password reset successfully. You can now log in with your new password." }
// 400 — invalid/expired token or password too short
```

---

### Resume Management (`/api/resume/*`)
All require authentication.

#### `GET /api/resume`
```json
// Response 200
{
  "resumes": [
    { "id": "uuid", "target_role": "string", "target_country": "string", "target_city": "string|null", "match_percentage": 75, "ats_score": 83, "created_at": "ts" }
  ]
}
```

#### `GET /api/resume/:id`
```json
// Response 200
{
  "resume": {
    "id": "uuid",
    "user_id": "uuid",
    "file_path": "string|null",
    "parsed_text": "string|null",
    "target_role": "string",
    "target_country": "string",
    "target_city": "string|null",
    "job_description": "string|null",
    "match_percentage": 75,
    "ats_score": 83,
    "ai_analysis": { "strengths": [...], "weaknesses": [...], "suggestions": [...], "atsBreakdown": {...}, "improvements": {...} },
    "template_id": "modern",
    "form_data": { /* ResumeFormData or null */ },
    "created_at": "ts"
  }
}
// Errors: 404 (not found or not owned), 500
```

#### `GET /api/resume/:id/file`
Auth required. Streams the original uploaded PDF for Path A resumes.
```
// Response 200: Binary PDF (Content-Type: application/pdf)
// Errors: 404 if resume not found, not owned by user, file_path is null, or file missing from disk
```
**Path A only** — Path B (builder) resumes have no uploaded file and always return 404.

#### `POST /api/resume/upload`
- Content-Type: `multipart/form-data`
- Fields: `file` (PDF only, max 5MB), `targetRole`, `targetCountry`, `targetCity?`, `jobDescription?` (max 5000 chars)
- Process: validate → multer save to `uploads/` → pdf-parse v2 → AI analysis → DB insert → AI structure extraction (best-effort) → history insert
```json
// Response 201
{ "resume": { /* full resume row */ } }
// Errors: 400 (missing file), 500 (parsing/AI error)
```
On upload, one `analysis_history` row is inserted with the initial analysis.

#### `POST /api/resume/build`
```json
// Request: ResumeFormData merged with { templateId? }
// Response 201
{ "resume": { /* full resume row */ } }
// Errors: 400 (validation), 500
```

#### `DELETE /api/resume/:id`
Deletes resume, resume_data (CASCADE), and uploaded file from disk. Response: `{ "message": "Resume deleted" }`

#### `POST /api/resume/parse-text`
- Content-Type: `multipart/form-data`
- Fields: `file` (PDF only, max 5MB)
- Rate limited. Parses the uploaded PDF server-side and returns the extracted text.
```json
// Response 200
{ "text": "string" }
// Errors: 400 (missing/invalid file), 500
```

#### `POST /api/resume/draft/save`
```json
// Request
{ "formData": { /* ResumeFormData */ }, "resumeId": "uuid (optional)" }
// Response 200
{ "success": true, "resumeId": "uuid", "message": "Draft saved successfully" }
```

#### `GET /api/resume/draft/:id`
```json
// Response 200
{ "resumeId": "uuid", "formData": { /* ResumeFormData */ }, "updatedAt": "ts" }
// Errors: 404
```

#### `POST /api/resume/:id/switch-template`
```json
// Request
{ "templateId": "uuid (from templates table)" }
// Response 200
{ "message": "Template switched successfully", "template": { /* Template object */ } }
// Errors: 400 (missing templateId), 403 (insufficient subscription tier), 404 (resume/template not found)
```
Note: `resumes.template_id` stores the template **slug** (e.g., `"modern"`), not the UUID.

---

### Templates (`/api/templates/*`)
All require authentication.

#### `GET /api/templates`
Returns all active templates with lock status based on user's subscription tier.
```json
// Response 200
{
  "templates": [
    {
      "id": "uuid",
      "name": "modern",
      "displayName": "Modern",
      "description": "string",
      "category": "modern",
      "thumbnailUrl": "string",
      "isAtsFriendly": false,
      "requiredTier": "free",
      "isLocked": false
    }
  ],
  "userTier": "free"
}
```
Note: `supportsPhoto` and `supportsColorCustomization` are no longer returned — photo support is determined client-side.

#### `GET /api/templates/:id`
Returns single template (no configuration block — styling lives in React components).
```json
// Response 200
{
  "template": {
    "id": "uuid",
    "name": "modern",
    "displayName": "Modern",
    "description": "string",
    "category": "modern",
    "thumbnailUrl": "string",
    "isAtsFriendly": false,
    "requiredTier": "free"
  }
}
// Errors: 404
```

---

### Analysis (`/api/analysis/*`)
All require authentication. Rate limited to 10 requests per 15 minutes (AI cost control).

#### `POST /api/analysis/match`
```json
// Request
{ "resumeId": "uuid" }
// Response 200
{ "matchPercentage": 75, "strengths": [...], "weaknesses": [...], "suggestions": [...] }
```

#### `POST /api/analysis/ats-score`
```json
// Request
{ "resumeId": "uuid" }
// Response 200
{ "atsBreakdown": { "formatCompliance": 35, "keywordMatch": 30, "sectionCompleteness": 18, "totalScore": 83, "keywords": { "matched": [...], "missing": [...] } } }
```
Results cached in `resumes.ai_analysis` JSONB — subsequent calls return cached data without OpenAI call.

#### `POST /api/analysis/improve`
```json
// Request
{ "resumeId": "uuid", "forceRefresh": false }
// Response 200
{ "suggestions": [...], "detailed": { "actionVerbs": [...], "quantifiedAchievements": [...], "missingSections": [...], "keywordOptimization": [...], "formattingIssues": [...] } }
```
Results cached in `resumes.ai_analysis` JSONB. Pass `forceRefresh: true` to bypass cache.

#### `POST /api/analysis/reanalyze`
```json
// Request
{ "resumeId": "uuid", "targetRole": "string", "targetCountry": "string?", "targetCity": "string?", "jobDescription": "string? (max 5000)" }
// Response 200
{ "matchPercentage": 75, "strengths": [...], "weaknesses": [...], "suggestions": [...] }
```
Clears cached `atsBreakdown` and `improvements`. Inserts a new row in `analysis_history`.

#### `GET /api/analysis/history/:resumeId`
```json
// Response 200
{
  "history": [
    {
      "id": "uuid",
      "target_role": "string|null",
      "job_description": "string|null",
      "match_percentage": 75,
      "ai_analysis": { "strengths": [...], "weaknesses": [...], "suggestions": [...] },
      "created_at": "2026-02-27T10:00:00Z"
    }
  ]
}
```
Returns last 5 entries for the resume, ordered most-recent first. Each upload and each re-analyze inserts one row.

---

### Export (`/api/export/*`)
All require authentication.

#### `POST /api/export/pdf-from-html`
```json
// Request (up to 10MB — may include base64 photos)
{ "html": "<full HTML string of rendered React template>" }
// Response 200: Binary PDF (application/pdf, attachment)
```
Template-aware export: client renders the React template to HTML (via `flushSync`+`createRoot`), sends the HTML string. Server passes it to Puppeteer with zero margins so the template controls all spacing.

#### `GET /api/export/markdown/:resumeId`
Auth required. Generates Markdown from stored parsed text.
```
// Response 200: Markdown text (text/markdown, attachment; filename: resume.md)
// Errors: 404 (resume not found), 500
```

---

### Cover Letters (`/api/cover-letter/*`)
All require authentication. Multiple letters allowed per resume (migration 027 dropped `UNIQUE(resume_id)`).
Letters are keyed by their own UUID — `GET/PUT/DELETE` use `/:id` (letter UUID), not `/:resumeId`.

#### `GET /api/cover-letter/`
Returns all cover letters for the authenticated user (limit 10, DESC by `updated_at`). Includes `target_role` from joined resumes table.
```json
// Response 200
{ "letters": [ /* CoverLetter[] */ ] }
```

#### `GET /api/cover-letter/resume/:resumeId`
Returns all cover letters attached to a specific resume (ownership check on resume).
```json
// Response 200
{ "letters": [ /* CoverLetter[] */ ] }
```

#### `GET /api/cover-letter/:id`
```json
// Response 200
{ "letter": { "id": "uuid", "resume_id": "uuid|null", "user_id": "uuid", "job_title": "string|null", "content": "string", "generated_content": "string", "tone": "string", "word_count_target": 300, "created_at": "ts", "updated_at": "ts" } }
// Errors: 404
```

#### `POST /api/cover-letter/extract-keywords`
Rate limited (AI cost control). Extracts matched/missing keywords from resume text + job description.
Resume text truncated to 3000 chars, JD to 2000 chars before GPT call.
```json
// Request
{ "resumeId": "uuid (optional)", "resumeText": "string (optional)", "jobDescription": "string" }
// Response 200
{ "keywords": { "matched": ["keyword1", ...], "missing": ["keyword2", ...] } }
// Errors: 400 (missing resumeId or resumeText), 500
```

#### `POST /api/cover-letter/generate`
Rate limited. Generates a new cover letter and persists it to DB. `resume_id` may be null (standalone letter).
```json
// Request
{
  "resumeId": "uuid (optional — null for standalone letters)",
  "resumeText": "string (optional, used when resumeId omitted)",
  "jobTitle": "string",
  "companyName": "string",
  "jobDescription": "string",
  "tone": "professional|conversational|enthusiastic|formal (default: professional)",
  "wordCountTarget": "short|medium|long (default: medium)",
  "keywords": { "matched": [...], "missing": [...] },
  "whyThisCompany": "string (optional)",
  "achievementToHighlight": "string (optional)"
}
// Response 201
{ "letter": { /* CoverLetter */ } }
// Errors: 400, 500
```

#### `PUT /api/cover-letter/:id`
Saves manual edits to a cover letter.
```json
// Request
{ "content": "string" }
// Response 200
{ "letter": { /* CoverLetter */ } }
// Errors: 404
```

#### `DELETE /api/cover-letter/:id`
```json
// Response 200
{ "message": "Cover letter deleted" }
// Errors: 404
```

#### `POST /api/cover-letter/:id/regenerate`
Regenerates an existing cover letter (replaces `content` and `generated_content` in DB).
Requires letter to have a non-null `resume_id` — standalone letters cannot be regenerated.
```json
// Request: same shape as /generate (minus resumeId/resumeText)
// Response 200
{ "letter": { /* CoverLetter */ } }
// Errors: 400 (standalone letter), 404, 500
```

#### `POST /api/cover-letter/:id/improve`
Improves an existing cover letter using `generated_content` as the base (not `content`).
GPT-4o-mini weaves personalizations into the letter.
```json
// Request
{ "whyThisCompany": "string (optional)", "achievementToHighlight": "string (optional)" }
// Response 200
{ "letter": { /* CoverLetter */ } }
// Errors: 404, 500
```

---

## Data Structures

### ResumeFormData (Server-side storage format)
```typescript
interface ResumeFormData {
  // Personal
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: Array<{
    id: string;
    label: string;       // 'GitHub' | 'Behance' | 'Medium' | 'Dribbble' | 'YouTube' | 'Custom'
    customLabel?: string;
    url: string;
  }>;
  profilePhoto?: string;   // Base64 DataURL, only on photo-supporting templates

  // Target
  targetRole: string;
  targetIndustry: string;
  targetCountry: string;
  targetCity?: string;

  // Education
  education: Array<{
    degreeType: string;
    major: string;
    university: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework: string;
    honors?: string;
  }>;

  // Experience
  experience: Array<{
    type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
    company: string;
    role: string;
    duration: string;
    responsibilities: string;
    industry?: string;
  }>;

  // Projects
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    role: string;
    link?: string;
  }>;

  // Skills
  skills: {
    technical: Array<{ category: string; items: string[] }>;
    soft: string[];
    languages: Array<{ language: string; proficiency: string }>;
  };

  professionalSummary: string;
  certifications?: string;
  extracurriculars?: string;
}
```

### Skills Data Transformation (Export Only)
```javascript
// Input (from form_data in DB):
skills.technical = [{ category: "Languages", items: ["Python", "JavaScript"] }]

// Transformed for Puppeteer template:
technicalSkills = "Languages: Python, JavaScript"
softSkills = ["Communication"]
languages = [{ name: "English", proficiency: "fluent" }]
```

---

## Database Schema

### users
`id` UUID PK, `name` VARCHAR(255), `email` VARCHAR(255) UNIQUE, `password` VARCHAR(255), `is_email_verified` BOOLEAN DEFAULT FALSE, `created_at` TIMESTAMP

### resumes
`id` UUID PK, `user_id` UUID FK→users, `file_path` TEXT nullable (Path A only), `parsed_text` TEXT nullable, `target_role` VARCHAR(255), `target_country` VARCHAR(100), `target_city` VARCHAR(100) nullable, `job_description` TEXT nullable, `match_percentage` INTEGER nullable, `ats_score` INTEGER nullable, `ai_analysis` JSONB nullable, `template_id` VARCHAR(50) DEFAULT `'modern'`, `status` VARCHAR(50), `created_with_live_preview` BOOLEAN, `created_at`, `updated_at`

### resume_data
`id` UUID PK, `resume_id` UUID FK→resumes (CASCADE DELETE), `form_data` JSONB

### analysis_history
`id` UUID PK, `resume_id` UUID FK→resumes (CASCADE DELETE), `user_id` UUID FK→users (CASCADE DELETE), `target_role` VARCHAR(255) nullable, `job_description` TEXT nullable, `match_percentage` INTEGER nullable, `ai_analysis` JSONB nullable, `created_at` TIMESTAMP WITH TIME ZONE
- Index: `idx_analysis_history_resume` on `resume_id`
- Populated on: `POST /resume/upload` (initial analysis) and `POST /analysis/reanalyze` (each re-run)
- Queried by: `GET /analysis/history/:resumeId` (last 5 DESC)

### templates
`id` UUID PK, `name` VARCHAR(100) UNIQUE (slug, e.g. `"modern"`), `display_name` VARCHAR(255), `description` TEXT, `category` VARCHAR(50), `thumbnail_url` TEXT, `supports_multiple_columns` BOOLEAN, `is_ats_friendly` BOOLEAN, `required_tier` VARCHAR(20) ('free'|'monthly'|'annual'), `sort_order` INTEGER, `is_active` BOOLEAN, `created_at`
Note: `preview_images`, `supports_photo`, `supports_color_customization` columns dropped in migration 012.
Current default template: `'modern'` (sort_order=0). Active templates: `modern`, `modern_yellow_split`, `dark_ribbon_modern`, `modern_minimalist_block`, `editorial_earth_tone`, `ats_clean`, `ats_lined`.

### subscriptions
`id` UUID PK, `user_id` UUID FK→users, `tier` VARCHAR(20), `status` VARCHAR(20), `expires_at` TIMESTAMP nullable

### resume_history
`id` UUID PK, `resume_id` UUID, `user_id` UUID, `change_type` VARCHAR(50), `previous_template_name` VARCHAR(100), `new_template_name` VARCHAR(100), `changed_fields` JSONB, `created_at`
(Tracks template switches — separate from `analysis_history`)

### email_verification_tokens
`id` UUID PK, `user_id` UUID FK→users (CASCADE DELETE), `token_hash` VARCHAR(255), `expires_at` TIMESTAMP, `created_at` TIMESTAMP

### password_reset_tokens
`id` UUID PK, `user_id` UUID FK→users (CASCADE DELETE), `token_hash` VARCHAR(255), `expires_at` TIMESTAMP, `used` BOOLEAN DEFAULT FALSE, `created_at` TIMESTAMP

### session
PostgreSQL session store managed by `express-session`.

### cover_letters
`id` UUID PK, `resume_id` UUID FK→resumes **nullable** (ON DELETE CASCADE), `user_id` UUID FK→users (ON DELETE CASCADE), `job_title` VARCHAR(255) nullable, `content` TEXT, `generated_content` TEXT, `tone` VARCHAR(50), `word_count_target` VARCHAR(20), `created_at` TIMESTAMP, `updated_at` TIMESTAMP
Index: `idx_cover_letters_resume_created(resume_id, created_at DESC)`
- `resume_id` is nullable — null means standalone letter not attached to any resume
- No `UNIQUE(resume_id)` constraint — multiple letters allowed per resume (dropped migration 027)
- `job_title` added in migration 027

### migrations
Tracks which numbered migrations have been run (001–029).

**Migration list:**
| # | Name | Description |
|---|------|-------------|
| 001 | create_users | Users table |
| 002 | create_sessions | Session store table |
| 003 | create_resumes | Resumes table |
| 004 | create_resume_data | Resume form data JSONB |
| 005 | add_live_preview_columns | Adds live-preview columns to resumes |
| 006 | add_templates | Templates table |
| 007 | seed_templates | Seeds initial templates |
| 008 | seed_free_templates | Seeds free-tier templates |
| 009 | seed_new_templates | Seeds additional templates |
| 010 | seed_sleek_director_template | Seeds sleek_director |
| 011 | delete_unwanted_templates | Removes unwanted template rows |
| 012 | per_template_cleanup | Drops `template_configurations`, removes `supports_photo`/`supports_color_customization`/`preview_images` columns |
| 013 | add_modern_yellow_split_template | Seeds `modern_yellow_split` |
| 014 | add_template_id_to_resumes | Adds `template_id` column to resumes |
| 015 | add_dark_ribbon_modern_template | Seeds `dark_ribbon_modern` (sort_order=9) |
| 016 | add_modern_minimalist_block_template | Seeds `modern_minimalist_block` (sort_order=10) |
| 017 | add_editorial_earth_tone_template | Seeds `editorial_earth_tone` (sort_order=11) |
| 018 | add_job_description_to_resumes | Adds `job_description TEXT` to resumes |
| 019 | create_analysis_history | Creates `analysis_history` table |
| 020 | email_verification | Adds `name`+`is_email_verified` to users; creates `email_verification_tokens`; marks existing users verified |
| 021 | password_reset | Creates `password_reset_tokens` table |
| 022 | create_cover_letters | Creates `cover_letters` table with `UNIQUE(resume_id)` |
| 023 | remove_deleted_templates | Deletes 5 legacy template rows; migrates resumes to `modern_yellow_split` |
| 024 | remove_warm_creative_sleek_director | Deletes `warm_creative`+`sleek_director`; migrates resumes to `modern_yellow_split` |
| 025 | add_ats_templates | Adds `ats_clean` (sort_order=12)+`ats_lined` (sort_order=13); recategorizes `modern_yellow_split`+`editorial_earth_tone` to `modern` category |
| 026 | add_modern_template | Adds `modern` (sort_order=0, single-col centered, Inter font, default template) |
| 027 | alter_cover_letters_multiple | Drops `UNIQUE(resume_id)` constraint; adds `job_title VARCHAR(255)` column; new index on `(resume_id, created_at DESC)` |
| 028 | allow_null_resume_id_cover_letters | Makes `resume_id` nullable (enables standalone letters not attached to a resume) |
| 029 | update_template_thumbnails | Sets `thumbnail_url = '/thumbnails/{name}.png'` for all 7 active templates |

---

## Error Response Format
```json
{ "message": "Error description", "errors": { "field": "error message" } }
```

---

## Thumbnail Generation Script

Generates static PNG thumbnails for all 7 templates. Run once after adding/updating templates.

```bash
# From server/ directory (requires both dev servers running)
npm run generate:thumbnails
```

**Script:** `server/src/scripts/generate-thumbnails.ts`
**How it works:**
1. Launches Puppeteer browser
2. For each template ID, visits `http://localhost:5173/thumbnail-preview?template={id}`
3. Waits for `[data-thumbnail-ready="true"]` attribute (max 15s) — set by `ThumbnailPreviewPage` after render
4. Screenshots at 816×1056px viewport, `deviceScaleFactor: 2` (1632×2112 actual pixels)
5. Saves PNG to `client/public/thumbnails/{templateId}.png`

**Output files:** `client/public/thumbnails/modern.png`, `modern_yellow_split.png`, `dark_ribbon_modern.png`, `modern_minimalist_block.png`, `editorial_earth_tone.png`, `ats_clean.png`, `ats_lined.png`

After running, execute migration 029 to update `thumbnail_url` in the DB, or the URLs are already set correctly if migration was already applied.

---

## AI Integration

- Model: `gpt-4o-mini`, Temperature: 0.7 (analysis) / 0.8 (cover letter generation) / 0.3 (keyword extraction)
- JSON mode for structured output
- PDF parsing: `pdf-parse` v2.4.5 — `new PDFParse({ data: Uint8Array, standardFontDataUrl })` → `.getText()` → `.text`
- `extractResumeStructure` — best-effort AI extraction of structured data from uploaded PDF text (populates `resume_data` for Path A, enabling PDF export)
- `keywordExtractor.ts` — `extractKeywords({ resumeText, jobDescription })` — extracts matched/missing keywords (gpt-4o-mini, temp 0.3, JSON mode)
- `coverLetterGenerator.ts` — generates cover letters (gpt-4o-mini, temp 0.8); supports 4 tones (`professional`, `conversational`, `enthusiastic`, `formal`) and 3 length targets

---

## Security

- Helmet.js for security headers
- CORS configured for `CLIENT_URL` origin
- Password hashing with bcrypt
- Input validation with express-validator
- Session-based auth (no JWT)
- Prompt injection sanitization on all AI inputs (`sanitizePromptInput`)
- AI-specific rate limiting (10 req/15min on `/api/analysis/*` and `/api/ai/*`)

---

## Environment Variables
```env
DATABASE_URL=postgresql://user:password@localhost:5432/airesume
SESSION_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Production Deployment

In production (`NODE_ENV=production`), the server also serves the React SPA:
- `express.static(client/dist)` serves hashed asset files
- `GET *` fallback sends `client/dist/index.html` for all non-API routes
- All API routes (`/api/*`) are matched first — the SPA fallback only activates for non-API paths
- `client/dist/` is expected at `../../client/dist` relative to `server/dist/app.js`

Start command: `NODE_ENV=production node server/dist/app.js`

---

## Common Issues & Solutions

1. **Double `/api` in paths** — Client must use relative paths (`/auth/login`, not `/api/auth/login`)
2. **Skills structure mismatch** — `exportController.ts` transforms nested→flat before Puppeteer render
3. **Session not persisting** — Ensure `withCredentials: true` in axios config
4. **PDF parsing fails in tests** — Run with `--experimental-vm-modules` flag
5. **Template UUID vs slug** — `switch-template` API accepts UUID; `resumes.template_id` stores slug
6. **PDF from HTML 413 error** — Ensure `express.json({ limit: '10mb' })` is set (base64 photos make HTML large)
7. **`GET /resume/:id/file` 404** — Resume is Path B (no uploaded file), or file was deleted from disk
