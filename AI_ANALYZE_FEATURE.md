# AI Analyze Feature — Full Documentation

> Covers the complete resume analysis pipeline: UI flow, business logic, AI prompts, API contracts, caching, rate limiting, database schema, and security.

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [UI Flow](#2-ui-flow)
3. [Component Reference](#3-component-reference)
4. [Backend Business Flow](#4-backend-business-flow)
5. [API Reference](#5-api-reference)
6. [AI Services & Exact Prompts](#6-ai-services--exact-prompts)
7. [Caching Strategy](#7-caching-strategy)
8. [Rate Limiting](#8-rate-limiting)
9. [Database Schema](#9-database-schema)
10. [Security — Prompt Injection Defense](#10-security--prompt-injection-defense)
11. [TypeScript Interfaces](#11-typescript-interfaces)
12. [Key File Index](#12-key-file-index)

---

## 1. Feature Overview

The AI Analyze feature evaluates how well a resume matches a target role. It produces:

| Output | When Computed | Cached? |
|--------|--------------|---------|
| **Match %** + strengths / weaknesses / suggestions | On upload / re-analyze | Yes — `resumes.match_percentage` + `ai_analysis` JSONB |
| **ATS Score** (format, keyword, sections, keywords list) | On demand (button click) | Yes — `ai_analysis.atsBreakdown` |
| **Detailed Improvements** (action verbs, achievements, sections, keywords, formatting) | On demand (button click) | Yes — `ai_analysis.improvements` |
| **Analysis History** | After each re-analyze run | Yes — `analysis_history` table (last 5) |

**Two entry paths:**
- **Path A** — User uploads a PDF → text extracted → AI analysis runs immediately
- **Path B** — User builds resume via multi-step form → form data serialized → AI analysis runs on submit

---

## 2. UI Flow

### 2.1 Path A — PDF Upload

```
ResumeUploadPage (/upload)
│
├─ Step 1: FileUpload component
│     • Drag-and-drop or click-to-browse
│     • Validates: PDF only, max 10 MB
│     • Shows filename + size on selection
│
├─ Step 2: TargetRoleForm component
│     • Required: Target Role (text input)
│     • Required: Target Country (text input)
│     • Optional: Target City (text input)
│     • Optional: Job Description (collapsible textarea, max 5 000 chars, character counter)
│     • Validation: targetRole + targetCountry must be non-empty
│
├─ On Submit → builds FormData, sends to POST /api/resume/upload
│     AbortController attached (allows mid-flight cancellation)
│
└─ UploadProgress component (status feedback):
      uploading  → "Uploading your resume..."  (blue, spinner)
      parsing    → "Parsing PDF content..."    (blue, spinner)  [+1.5 s]
      analyzing  → "Analyzing with AI..."      (blue, spinner)  [+3 s]
      success    → "Analysis complete!"        (green, ✓)
      error      → errorMessage               (red, ✗)

      On success → navigate to /resume/:id
```

### 2.2 Path B — Resume Builder

```
ResumeBuilderPage (/build)
│
├─ Multi-step form (7 steps)
│
└─ On final Submit → POST /api/resume/build
      → navigate to /resume/:id
```

### 2.3 Analysis Results Page

```
ResumeAnalysisPage (/resume/:id)
│
├─ Initial load (parallel):
│     getResume(id)           → metadata, form_data, template_id
│     getMatchAnalysis(id)    → match %, strengths, weaknesses, suggestions
│     getAnalysisHistory(id)  → last 5 analysis runs (with .catch fallback)
│
├─ Header
│     Title + target role
│     "Has JD" badge (if job_description present)
│     [Re-analyze] button (top-right)
│     [← Back] link
│
├─ PDF Viewer toggle (Path A only, when file_path is not null)
│     Button: "Show PDF" / "Hide PDF"
│     iframe: GET /api/resume/:id/file (Content-Type: application/pdf)
│
├─ Re-analyze Panel (toggled by header button)
│     Input: Target Role (pre-filled)
│     Toggle: "+ Add job description..." → textarea (max 5 000 chars)
│     [Run Analysis] (disabled if role empty) | [Cancel]
│     On success: updates match state, clears ATS + improvements, refreshes history, toast
│
├─ MatchScoreCard
│     Large % display (green ≥75, yellow ≥50, red <50)
│     Strengths list (green) | Weaknesses list (red)
│     General suggestions list
│
├─ AtsScoreCard
│     State 1 — not calculated: [Calculate ATS Score] button
│     State 2 — loading: skeleton pulse
│     State 3 — calculated:
│       SVG donut chart (128×128, r=54)
│         green #16a34a ≥80 | yellow #ca8a04 ≥60 | red #dc2626 <60
│         animated stroke-dashoffset (0.6 s ease)
│       Sub-scores: formatCompliance /40, keywordMatch /40, sectionCompleteness /20, total /100
│       Matched keywords (green badges) | Missing keywords (red badges)
│
├─ ImprovementSuggestions
│     State 1 — not loaded: [Get Detailed Suggestions] button
│     State 2 — loading: skeleton
│     State 3 — loaded:
│       Action Verbs: strikethrough current → green suggested
│       Quantified Achievements: suggestions
│       Missing Sections: list
│       Keyword Optimization: keyword + reason
│       Formatting Issues: list
│     After first load: button changes to [Regenerate Suggestions] (forceRefresh=true)
│
├─ Analysis History (shown only when history.length > 1)
│     Up to 5 entries, clickable
│     Each entry: target role | match % badge | date | JD preview (first 80 chars)
│     Active entry highlighted (indigo border)
│     Click → restores match/strengths/weaknesses/suggestions; clears ATS + improvements
│
└─ ExportButtons
      [Download PDF]      → exportPdfWithTemplate(templateId, resumeFormData)
      [Download Markdown] → exportMarkdown(id)
```

---

## 3. Component Reference

### ResumeUploadPage (`client/src/pages/ResumeUploadPage.tsx`)

| State | Type | Purpose |
|-------|------|---------|
| `file` | `File \| null` | Selected PDF |
| `status` | `UploadStatus \| null` | Progress state |
| `errorMessage` | `string` | Backend error |
| `fileError` | `string` | Client validation error |
| `abortControllerRef` | `Ref<AbortController>` | Upload cancellation |
| `timeoutIdsRef` | `Ref<ReturnType<typeof setTimeout>[]>` | Progress state timers |

### ResumeAnalysisPage (`client/src/pages/ResumeAnalysisPage.tsx`)

| State Group | Variables |
|-------------|-----------|
| Page flags | `loading`, `error`, `dataLoaded` |
| Resume metadata | `targetRole`, `targetCountry`, `targetCity`, `jobDescription` |
| Export data | `resumeFormData`, `templateId` |
| Match | `matchPercentage`, `strengths[]`, `weaknesses[]`, `suggestions[]` |
| ATS | `atsBreakdown`, `atsLoading` |
| Improvements | `detailed`, `improvementsLoading` |
| PDF viewer | `hasFile`, `showPdf` |
| History | `history[]`, `activeHistoryId` |
| Re-analyze | `showReanalyze`, `reanalyzeLoading`, `reanalyzeRole`, `reanalyzeJd`, `showReanalyzeJd` |

---

## 4. Backend Business Flow

### 4.1 Initial Analysis (on upload)

```
POST /api/resume/upload  (multipart/form-data)
│
├─ multer saves file → Cloudinary upload (parallel with text extraction)
├─ pdf-parse extracts text from PDF
├─ sanitizePromptInput(resumeText, jobDescription)
├─ analyzeResume({ resumeText, targetRole, targetCountry, targetCity, jobDescription })
│     → OpenAI gpt-4o-mini → { matchPercentage, aiAnalysis }
│
├─ [best-effort, non-fatal] extractResumeStructure(resumeText, targetRole)
│     → OpenAI → structured form_data
│
├─ INSERT INTO resumes:
│     parsed_text, file_path (Cloudinary URL), target_role, target_country, target_city,
│     match_percentage, ai_analysis (JSONB: strengths/weaknesses/suggestions), job_description
│
├─ INSERT INTO analysis_history:
│     resume_id, user_id, target_role, job_description, match_percentage, ai_analysis
│
├─ [if structure extracted] INSERT INTO resume_data: form_data
│
└─ RETURN { resume: { id, ... } }
```

### 4.2 Get Match Analysis

```
POST /api/analysis/match
│
├─ SELECT * FROM resumes WHERE id = $1 AND user_id = $2
└─ RETURN cached: match_percentage, ai_analysis.strengths/weaknesses/suggestions
   (No AI call — data was stored on upload)
```

### 4.3 Get ATS Score (lazy, cached)

```
POST /api/analysis/ats-score
│
├─ SELECT * FROM resumes WHERE id = $1 AND user_id = $2
├─ IF ats_score NOT NULL AND ai_analysis.atsBreakdown EXISTS → return cache
│
├─ [cache miss] calculateAtsScore({ resumeText, targetRole, jobDescription })
│     → OpenAI gpt-4o-mini → { formatCompliance, keywordMatch, sectionCompleteness, totalScore, keywords }
│
├─ UPDATE resumes SET ats_score = totalScore, ai_analysis = { ...existing, atsBreakdown }
└─ RETURN { atsBreakdown }
```

### 4.4 Get Detailed Improvements (lazy, cached)

```
POST /api/analysis/improve
│
├─ SELECT * FROM resumes WHERE id = $1 AND user_id = $2
├─ IF ai_analysis.improvements EXISTS AND NOT forceRefresh → return cache
│
├─ [cache miss / forceRefresh] analyzeImprovements({ resumeText, targetRole, jobDescription })
│     → OpenAI gpt-4o-mini → DetailedImprovements
│
├─ UPDATE resumes SET ai_analysis = { ...existing, improvements: detailed }
└─ RETURN { suggestions: aiAnalysis.suggestions, detailed }
```

### 4.5 Re-Analyze

```
POST /api/analysis/reanalyze
│
├─ SELECT * FROM resumes WHERE id = $1 AND user_id = $2
├─ sanitizePromptInput(jobDescription)
├─ analyzeResume({ resumeText, targetRole, targetCountry, targetCity, jobDescription })
│     → OpenAI gpt-4o-mini → { matchPercentage, aiAnalysis }
│
├─ UPDATE resumes:
│     target_role, target_country, target_city, job_description,
│     match_percentage, ai_analysis (ONLY strengths/weaknesses/suggestions — clears cache),
│     ats_score = NULL  ← clears ATS cache
│
├─ INSERT INTO analysis_history (new entry)
│
└─ RETURN { matchPercentage, strengths, weaknesses, suggestions }
```

### 4.6 Get Analysis History

```
GET /api/analysis/history/:resumeId
│
├─ SELECT id, target_role, job_description, match_percentage, ai_analysis, created_at
│  FROM analysis_history
│  WHERE resume_id = $1 AND user_id = $2
│  ORDER BY created_at DESC LIMIT 5
│
└─ RETURN { history: [] }
```

---

## 5. API Reference

All analysis endpoints require authentication (`isAuthenticated` middleware).
Base path: `/api/analysis`

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| POST | `/match` | `{ resumeId }` | `{ matchPercentage, strengths[], weaknesses[], suggestions[] }` |
| POST | `/ats-score` | `{ resumeId }` | `{ atsBreakdown }` |
| POST | `/improve` | `{ resumeId, forceRefresh? }` | `{ suggestions[], detailed }` |
| POST | `/reanalyze` | `{ resumeId, targetRole, targetCountry?, targetCity?, jobDescription? }` | `{ matchPercentage, strengths[], weaknesses[], suggestions[] }` |
| GET | `/history/:resumeId` | — | `{ history[] }` |

### Input validators (analysis routes)

```typescript
body('resumeId').exists().isString().trim().notEmpty()
body('jobDescription').optional().isString().trim().isLength({ max: 5000 })

// /reanalyze additionally:
body('targetRole').exists().isString().trim().notEmpty()
body('targetCountry').optional().isString().trim()
body('targetCity').optional().isString().trim()
```

### Frontend API helpers (`client/src/utils/api.ts`)

```typescript
uploadResume(formData: FormData, options?: { signal?: AbortSignal })
  → { resume: Resume }

getResume(id: string)
  → { resume: { id, file_path, parsed_text, target_role, target_country, target_city,
                match_percentage, ai_analysis, ats_score, job_description, created_at,
                form_data, template_id } }

getMatchAnalysis(resumeId: string)
  // POST /api/analysis/match

getAtsScore(resumeId: string)
  // POST /api/analysis/ats-score

getImprovements(resumeId: string, forceRefresh = false)
  // POST /api/analysis/improve

reanalyzeResume(resumeId: string, params: { targetRole, targetCountry?, targetCity?, jobDescription? })
  // POST /api/analysis/reanalyze

getAnalysisHistory(resumeId: string)
  // GET /api/analysis/history/:resumeId
```

---

## 6. AI Services & Exact Prompts

All services use **`gpt-4o-mini`** and apply `sanitizePromptInput()` to every user-supplied string before injection.

---

### 6.1 `resumeAnalyzer.ts` — Match Analysis

**File:** `server/src/services/ai/resumeAnalyzer.ts`
**Temperature:** `0.3`
**Called by:** `uploadResume` (on upload), `reanalyze` (on re-analyze)

**System prompt:**
```
You are an expert resume analyst. Analyze resumes and provide structured feedback as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "matchPercentage": <number 0-100>,
  "aiAnalysis": {
    "strengths": ["strength1", "strength2", ...],
    "weaknesses": ["weakness1", "weakness2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
  }
}
```

**User prompt:**
```
Analyze this resume for a "{targetRole}" position in {locationStr}.

Resume:
{sanitizedResumeText}
[JD section if provided — see below]
Provide:
1. A match percentage (0-100) for how well this resume fits the target role and location
2. Key strengths relevant to the role
3. Weaknesses or gaps
4. Specific actionable suggestions for improvement

Respond with ONLY valid JSON.
```

**JD section** (appended when `jobDescription` is provided):
```
\nJob Description to match against:\n{sanitizedJd}\n\nSpecifically evaluate how well the resume matches THIS job description. Extract keywords from the JD and check for their presence.
```

**Location string:** `"${targetCity}, ${targetCountry}"` or just `"${targetCountry}"` if no city.

---

### 6.2 `atsScorer.ts` — ATS Compatibility Score

**File:** `server/src/services/ai/atsScorer.ts`
**Temperature:** `0.3`
**Called by:** `getAtsScore` controller (on button click, cached after first call)

**System prompt:**
```
You are an expert ATS (Applicant Tracking System) analyst. Score resumes for ATS compatibility and provide structured feedback as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "formatCompliance": <number 0-40>,
  "keywordMatch": <number 0-40>,
  "sectionCompleteness": <number 0-20>,
  "totalScore": <number 0-100>,
  "keywords": {
    "matched": ["keyword1", "keyword2", ...],
    "missing": ["keyword1", "keyword2", ...]
  }
}

Scoring criteria:
- formatCompliance (0-40): Standard formatting, clean sections, no tables/images, proper headings
- keywordMatch (0-40): Relevant industry keywords, skills, and terminology for the target role
- sectionCompleteness (0-20): Presence of all key sections (contact, summary, education, experience, skills)
- totalScore: Sum of the three sub-scores
```

**User prompt:**
```
Analyze this resume for ATS compatibility for a "{targetRole}" position.

Resume:
{sanitizedResumeText}
{keywordInstruction}
Score the resume and identify matched and missing keywords. Respond with ONLY valid JSON.
```

**`keywordInstruction`** (when JD provided):
```
\nJob Description:\n{sanitizedJd}\n\nFor keywordMatch: score based on actual JD keywords present vs missing in the resume. List exact terms from the JD in matched/missing arrays.
```

**`keywordInstruction`** (when no JD):
```
(Use typical industry keywords for this role)
```

---

### 6.3 `improvementAnalyzer.ts` — Detailed Improvements

**File:** `server/src/services/ai/improvementAnalyzer.ts`
**Temperature:** `0.3`
**Called by:** `getImprovements` controller (on button click, cached; `forceRefresh=true` bypasses cache)

**System prompt:**
```
You are an expert resume coach. Analyze resumes and provide detailed, categorized improvement suggestions as JSON.
You must respond with ONLY valid JSON in this exact format:
{
  "actionVerbs": [{"current": "weak phrase", "suggested": "stronger alternative"}, ...],
  "quantifiedAchievements": [{"suggestion": "specific suggestion to add metrics"}, ...],
  "missingSections": ["section name", ...],
  "keywordOptimization": [{"keyword": "missing keyword", "reason": "why it matters"}, ...],
  "formattingIssues": ["issue description", ...]
}
```

**User prompt:**
```
Analyze this resume for a "{targetRole}" position and provide detailed improvement suggestions.

Resume:
{sanitizedResumeText}
[JD section if provided — see below]
Provide categorized improvements covering:
1. Weak action verbs that should be replaced with stronger ones
2. Opportunities to add quantified achievements
3. Missing resume sections
4. Keywords to add for ATS optimization
5. Formatting issues to fix

Respond with ONLY valid JSON.
```

**JD section** (appended when `jobDescription` is provided):
```
\nJob Description:\n{sanitizedJd}\n\nFor keywordOptimization: cite keywords directly from the job description above, with reason "appears in job description".
```

---

### 6.4 `resumeStructureExtractor.ts` — PDF Structure Extraction

**File:** `server/src/services/ai/resumeStructureExtractor.ts`
**Temperature:** `0.1` (very low — precision extraction)
**Called by:** `uploadResume` (best-effort, failure is silently swallowed)
**Purpose:** Populates `resume_data` table for Path A resumes so PDF export works

**System prompt:**
```
You are an expert resume parser. Extract structured data from the resume text into JSON matching this exact schema. Use empty strings or empty arrays for missing fields. Never omit required keys.

JSON schema:
{
  "fullName": string,
  "email": string,
  "phone": string,
  "city": string,
  "country": string,
  "professionalSummary": string,
  "education": [{"degreeType": string, "major": string, "university": string, "graduationDate": string, "gpa": string, "relevantCoursework": string, "honors": string}],
  "experience": [{"type": "full-time"|"internship"|"part-time"|"freelance"|"volunteer", "company": string, "role": string, "duration": string, "responsibilities": string}],
  "projects": [{"name": string, "description": string, "technologies": string, "role": string}],
  "skills": {
    "technical": [{"category": string, "items": [string]}],
    "soft": [string],
    "languages": [{"language": string, "proficiency": "native"|"fluent"|"professional"|"intermediate"|"basic"}]
  }
}

Respond with ONLY valid JSON.
```

**User prompt:**
```
Extract structured data from this resume[ (target role: {targetRole})]:\n\n{sanitizedResumeText}
```
(The `(target role: ...)` clause is included only when `targetRole` is provided.)

---

## 7. Caching Strategy

### 7.1 `resumes.ai_analysis` JSONB (analysis caching)

The `ai_analysis` column stores a growing JSONB object. Each analysis type is added as a key:

```jsonc
{
  "strengths": ["..."],       // always present (written on upload/re-analyze)
  "weaknesses": ["..."],      // always present
  "suggestions": ["..."],     // always present
  "atsBreakdown": { ... },    // written on first ATS score request
  "improvements": { ... }     // written on first improvements request
}
```

**Cache invalidation:** Re-analyzing overwrites `ai_analysis` with **only** `strengths/weaknesses/suggestions` and sets `ats_score = NULL`, effectively dropping `atsBreakdown` and `improvements` from the object so both are recomputed on next request.

### 7.2 `ai_cache` table (skills generation caching)

Used for `generateSkills` only (not analysis):

```sql
cache_key   = "skills_v2:{targetRole}:{targetIndustry}"  (lowercased + trimmed)
cache_value = JSONB (GeneratedSkills)
expires_at  = NOW() + INTERVAL '30 days'
```

Cache lookup: `SELECT cache_value FROM ai_cache WHERE cache_key = $1 AND expires_at > NOW()`
Cache upsert: `INSERT ... ON CONFLICT (cache_key) DO UPDATE SET ...`

---

## 8. Rate Limiting

Configured in `server/src/app.ts`:

```typescript
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window per IP
  message: { error: 'Too many AI requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/analysis', aiLimiter);   // match, ats-score, improve, reanalyze, history
app.use('/api/ai', aiLimiter);         // generate-skills, generate-summary
app.use('/api/cover-letter/extract-keywords', aiLimiter);
```

This means a user can make a combined maximum of 10 AI-touching requests (across all analysis + AI generation endpoints) per 15-minute window.

---

## 9. Database Schema

### `resumes` table (analysis-relevant columns)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK → users | |
| `file_path` | TEXT | Cloudinary URL (null for Path B) |
| `parsed_text` | TEXT | Extracted PDF text |
| `target_role` | VARCHAR(255) | |
| `target_country` | VARCHAR(255) | |
| `target_city` | VARCHAR(255) | nullable |
| `job_description` | TEXT | nullable, added migration 018 |
| `match_percentage` | INTEGER | 0–100 |
| `ai_analysis` | JSONB | `{ strengths, weaknesses, suggestions, atsBreakdown?, improvements? }` |
| `ats_score` | INTEGER | Cached `totalScore`; NULL after re-analyze |
| `template_id` | VARCHAR(50) | Default `'modern'` |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

### `analysis_history` table (migration 019)

```sql
CREATE TABLE IF NOT EXISTS analysis_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id         UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role       VARCHAR(255),
  job_description   TEXT,
  match_percentage  INTEGER,
  ai_analysis       JSONB,           -- { strengths, weaknesses, suggestions }
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analysis_history_resume ON analysis_history(resume_id);
```

Records are inserted:
1. On every successful upload (`uploadResume` controller)
2. On every re-analyze (`reanalyze` controller)

Only the **last 5** are returned to the frontend (ORDER BY created_at DESC LIMIT 5).

### `resume_data` table (Path B + Path A structured export)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `resume_id` | UUID FK → resumes | UNIQUE |
| `form_data` | JSONB | Full `ResumeFormData` object |
| `created_at` | TIMESTAMPTZ | |

---

## 10. Security — Prompt Injection Defense

**File:** `server/src/utils/sanitizePromptInput.ts`

Applied to **every** user-controlled string before it is injected into an AI prompt: resume text, job description, target role, custom instructions, etc.

### Steps

1. **Remove null bytes and control characters** (preserves `\n`, `\r`, `\t`):
   ```
   /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g  →  ''
   ```

2. **Strip prompt injection patterns** (replaced with `[redacted]`):
   ```
   ignore (all )?previous instructions
   ignore (all )?instructions
   disregard (all )?previous
   you are now
   new instructions
   system:
   assistant:
   [system]
   [assistant]
   <<SYS>>
   ```

3. **Truncate** to 8 000 characters maximum.

---

## 11. TypeScript Interfaces

### `AtsScoreBreakdown` (`server/src/services/ai/atsScorer.ts`)

```typescript
interface AtsScoreBreakdown {
  formatCompliance: number;     // 0–40
  keywordMatch: number;         // 0–40
  sectionCompleteness: number;  // 0–20
  totalScore: number;           // 0–100 (sum of above)
  keywords: {
    matched: string[];
    missing: string[];
  };
}
```

### `DetailedImprovements` (`server/src/services/ai/improvementAnalyzer.ts`)

```typescript
interface DetailedImprovements {
  actionVerbs: Array<{ current: string; suggested: string }>;
  quantifiedAchievements: Array<{ suggestion: string }>;
  missingSections: string[];
  keywordOptimization: Array<{ keyword: string; reason: string }>;
  formattingIssues: string[];
}
```

### `AiAnalysis` (`server/src/services/ai/resumeAnalyzer.ts`)

```typescript
interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}
```

### `AnalysisHistoryEntry` (frontend, `client/src/types/index.ts`)

```typescript
interface AnalysisHistoryEntry {
  id: string;
  target_role: string;
  job_description: string | null;
  match_percentage: number;
  ai_analysis: {
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
  };
  created_at: string;
}
```

### `ExtractedResumeData` (`server/src/services/ai/resumeStructureExtractor.ts`)

```typescript
interface ExtractedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  professionalSummary?: string;
  education?: Array<{
    degreeType: string; major: string; university: string;
    graduationDate: string; gpa?: string; relevantCoursework: string; honors?: string;
  }>;
  experience?: Array<{
    type: string; company: string; role: string;
    duration: string; responsibilities: string;
  }>;
  projects?: Array<{
    name: string; description: string; technologies: string; role: string;
  }>;
  skills?: {
    technical: Array<{ category: string; items: string[] }>;
    soft: string[];
    languages: Array<{ language: string; proficiency: string }>;
  };
}
```

---

## 12. Key File Index

| File | Role |
|------|------|
| `client/src/pages/ResumeUploadPage.tsx` | Path A upload UI, progress feedback |
| `client/src/pages/ResumeAnalysisPage.tsx` | Full analysis results page |
| `client/src/components/resume-upload/FileUpload.tsx` | PDF drag-drop input |
| `client/src/components/resume-upload/TargetRoleForm.tsx` | Role + location + JD form |
| `client/src/components/resume-upload/UploadProgress.tsx` | Uploading/parsing/analyzing status |
| `client/src/components/analysis/MatchScoreCard.tsx` | Match % + strengths/weaknesses |
| `client/src/components/analysis/AtsScoreCard.tsx` | SVG donut + sub-scores + keywords |
| `client/src/components/analysis/ImprovementSuggestions.tsx` | Categorized improvement cards |
| `client/src/utils/api.ts` | All frontend API helper functions |
| `server/src/controllers/analysisController.ts` | All 5 analysis handlers |
| `server/src/controllers/resumeController.ts` | `uploadResume`, `getResume` |
| `server/src/routes/analysis/index.ts` | Route definitions + validators |
| `server/src/services/ai/resumeAnalyzer.ts` | Match % AI service |
| `server/src/services/ai/atsScorer.ts` | ATS score AI service |
| `server/src/services/ai/improvementAnalyzer.ts` | Improvements AI service |
| `server/src/services/ai/resumeStructureExtractor.ts` | PDF → structured data AI service |
| `server/src/utils/sanitizePromptInput.ts` | Prompt injection defense |
| `server/src/app.ts` | AI rate limiter (`aiLimiter`) |
| `server/src/migrations/019_analysis_history.ts` | `analysis_history` table migration |
| `server/src/migrations/018_job_description.ts` | `job_description` column on resumes |
