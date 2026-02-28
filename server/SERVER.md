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
    "template_id": "modern_minimal",
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
Note: `resumes.template_id` stores the template **slug** (e.g., `"modern_minimal"`), not the UUID.

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
      "name": "modern_minimal",
      "displayName": "Modern Minimal",
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
    "name": "modern_minimal",
    "displayName": "Modern Minimal",
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
`id` UUID PK, `name` VARCHAR(255), `email` VARCHAR(255) UNIQUE, `password` VARCHAR(255), `created_at` TIMESTAMP

### resumes
`id` UUID PK, `user_id` UUID FK→users, `file_path` TEXT nullable (Path A only), `parsed_text` TEXT nullable, `target_role` VARCHAR(255), `target_country` VARCHAR(100), `target_city` VARCHAR(100) nullable, `job_description` TEXT nullable, `match_percentage` INTEGER nullable, `ats_score` INTEGER nullable, `ai_analysis` JSONB nullable, `template_id` VARCHAR(50) DEFAULT `'modern_minimal'`, `status` VARCHAR(50), `created_with_live_preview` BOOLEAN, `created_at`, `updated_at`

### resume_data
`id` UUID PK, `resume_id` UUID FK→resumes (CASCADE DELETE), `form_data` JSONB

### analysis_history
`id` UUID PK, `resume_id` UUID FK→resumes (CASCADE DELETE), `user_id` UUID FK→users (CASCADE DELETE), `target_role` VARCHAR(255) nullable, `job_description` TEXT nullable, `match_percentage` INTEGER nullable, `ai_analysis` JSONB nullable, `created_at` TIMESTAMP WITH TIME ZONE
- Index: `idx_analysis_history_resume` on `resume_id`
- Populated on: `POST /resume/upload` (initial analysis) and `POST /analysis/reanalyze` (each re-run)
- Queried by: `GET /analysis/history/:resumeId` (last 5 DESC)

### templates
`id` UUID PK, `name` VARCHAR(100) UNIQUE (slug, e.g. `"modern_minimal"`), `display_name` VARCHAR(255), `description` TEXT, `category` VARCHAR(50), `thumbnail_url` TEXT, `supports_multiple_columns` BOOLEAN, `is_ats_friendly` BOOLEAN, `required_tier` VARCHAR(20) ('free'|'monthly'|'annual'), `sort_order` INTEGER, `is_active` BOOLEAN, `created_at`
Note: `preview_images`, `supports_photo`, `supports_color_customization` columns dropped in migration 012.

### subscriptions
`id` UUID PK, `user_id` UUID FK→users, `tier` VARCHAR(20), `status` VARCHAR(20), `expires_at` TIMESTAMP nullable

### resume_history
`id` UUID PK, `resume_id` UUID, `user_id` UUID, `change_type` VARCHAR(50), `previous_template_name` VARCHAR(100), `new_template_name` VARCHAR(100), `changed_fields` JSONB, `created_at`
(Tracks template switches — separate from `analysis_history`)

### session
PostgreSQL session store managed by `express-session`.

### migrations
Tracks which numbered migrations have been run (001–019).

---

## Error Response Format
```json
{ "message": "Error description", "errors": { "field": "error message" } }
```

---

## AI Integration

- Model: `gpt-4o-mini`, Temperature: 0.7
- JSON mode for structured output
- PDF parsing: `pdf-parse` v2.4.5 — `new PDFParse({ data: Uint8Array, standardFontDataUrl })` → `.getText()` → `.text`
- `extractResumeStructure` — best-effort AI extraction of structured data from uploaded PDF text (populates `resume_data` for Path A, enabling PDF export)

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
