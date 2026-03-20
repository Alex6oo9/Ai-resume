# Resume Builder from Scratch — Complete Feature Documentation

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [End-to-End Data Flow](#3-end-to-end-data-flow)
4. [Frontend](#4-frontend)
   - 4.1 Page & State Management
   - 4.2 Form Steps (all 6)
   - 4.3 Live Preview
   - 4.4 Template System
   - 4.5 Draft Management
   - 4.6 API Calls from Client
5. [Backend](#5-backend)
   - 5.1 Routes
   - 5.2 Middleware & Validation
   - 5.3 Resume Controller
   - 5.4 AI Services
   - 5.5 Export Services
6. [Database Schema](#6-database-schema)
7. [Data Structures](#7-data-structures)
8. [AI Feature Deep-Dives](#8-ai-feature-deep-dives)
9. [Export System](#9-export-system)
10. [Error Handling & Security](#10-error-handling--security)
11. [Testing](#11-testing)
12. [Key File Index](#12-key-file-index)

---

## 1. Feature Overview

**Path B** lets users build a resume entirely from a multi-step form — no PDF required. Key capabilities:

| Capability | Description |
|---|---|
| 6-step guided form | Personal Info → Education → Experience → Skills → Summary → Additional |
| Real-time live preview | 300ms-debounced preview updates in a side panel using the selected template; preview spans full viewport height on desktop |
| AI skills generation | Auto-suggests technical skills based on target role + industry |
| AI summary writing | Generates a 2–3 sentence professional summary on demand |
| Draft persistence | Save/load incomplete forms (server-side, resumeId in URL) |
| Template switching | 7 visual templates (5 Modern + 2 ATS), persisted to localStorage; static PNG thumbnails |
| PDF + Markdown export | Puppeteer-rendered PDF or plain Markdown download |
| Cover letter | AI-generated cover letter with tone/length options, inline editing, PDF/TXT export |
| Email verification | Registration requires email verification before login is allowed |

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  BROWSER                                                            │
│                                                                     │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐   │
│  │   ResumeBuilderPage.tsx  │   │   ResumePreview.tsx          │   │
│  │   (form state, steps,    │◄──┤   (live preview,             │   │
│  │    validation, submit)   │   │    memoized, 300ms debounce) │   │
│  └────────────┬─────────────┘   └──────────────────────────────┘   │
│               │ api.ts (axios)                                       │
└───────────────┼─────────────────────────────────────────────────────┘
                │ HTTP (session cookie)
┌───────────────▼─────────────────────────────────────────────────────┐
│  EXPRESS SERVER (port 5000)                                         │
│                                                                     │
│  Middleware: isAuthenticated → validators → validate                │
│                                                                     │
│  ┌──────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │  /api/resume/*   │  │  /api/ai/*        │  │  /api/export/* │  │
│  │  resumeController│  │  skillsGenerator  │  │  exportCtrl    │  │
│  │  buildResume     │  │  summaryGenerator │  │  pdfGenerator  │  │
│  │  saveDraft       │  │                   │  │  (Puppeteer)   │  │
│  │  loadDraft       │  └────────┬──────────┘  └────────────────┘  │
│  └──────────┬───────┘           │                                  │
│             │                   │                                  │
│  ┌──────────▼───────────────────▼──────────────────────────────┐  │
│  │  OpenAI GPT-4o-mini                                         │  │
│  │  resumeGenerator | summaryGenerator | skillsGenerator       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL                                                 │  │
│  │  resumes | resume_data | ai_cache | analysis_history        │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End Data Flow

### 3.1 Build & Submit Flow

```
User navigates to /build
        │
        ▼
ResumeBuilderPage mounts
  • Initialize formData (empty ResumeFormData)
  • Check URL for ?id= → load draft if present
  • Read selectedTemplate from localStorage
        │
        ▼ (user fills steps 0-5)
Per-step validation on "Next":
  Step 0: 8 required fields
  Step 1: ≥1 education entry with 4 required fields
  Step 4: summary 100-500 chars
  Steps 2, 3, 5: optional
        │
        ▼ (user clicks Submit on step 5)
handleSubmit()
  1. validateFormData() — re-validates steps 0, 1, 4
  2. setStatus('analyzing')
  3. POST /api/resume/build { ...formData, templateId }
        │
        ▼ (backend)
buildResume controller:
  1. transformFormData() — flatten nested skills
  2. generateResume(transformedFormData) — GPT-4o-mini
  3. INSERT INTO resumes (parsed_text, match_percentage, ai_analysis, template_id)
  4. INSERT INTO resume_data (form_data JSONB) — raw frontend format
  5. Return { resume }
        │
        ▼ (frontend)
  success → navigate('/resume/:resumeId') after 1.5s
  error   → display in UploadProgress component
```

### 3.2 Skills Auto-Generation Flow

```
User enters Step 3 (Skills)
        │
        ▼
useEffect triggers (currentStep === 3)
  Check: !skillsGenerated || role changed || industry changed?
        │
        ▼
generateSkillsAutomatically()
  setIsGeneratingSkills(true)
        │
        ▼
POST /api/ai/generate-skills { targetRole, targetIndustry }
        │
        ▼ (backend: skillsGenerator)
  Check ai_cache table (key: "skills_v2:{role}:{industry}")
  Cache hit?  → return cached JSON
  Cache miss? → GPT-4o-mini → parse → INSERT ai_cache (30-day TTL) → return
        │
        ▼ (frontend)
  Flatten technical[].items → skillSuggestions (max 15)
  Display as clickable buttons (violet theme)
  User clicks button → addTechnicalSkill()
```

### 3.3 Draft Save/Load Flow

```
Save:
  User clicks "Save Draft"
    → POST /api/resume/draft/save { formData, resumeId? }
    → If no resumeId: INSERT resumes (status='draft') → return new resumeId
    → If resumeId: UPDATE resumes + UPSERT resume_data
    → Frontend stores resumeId in state; URL stays at /build

Load:
  User navigates to /build?id=<resumeId>
    → GET /api/resume/draft/:id
    → SELECT resume + resume_data
    → Return { resumeId, formData, updatedAt }
    → Frontend pre-marks steps as completed based on filled data
```

---

## 4. Frontend

### 4.1 Page & State Management

**File:** `client/src/pages/ResumeBuilderPage.tsx`

#### Key State

```typescript
// Navigation
const [currentStep, setCurrentStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

// Form data
const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
const debouncedFormData = useDebounce(formData, 300); // drives live preview

// Template
const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
// Persisted to: localStorage key 'resumeBuilder_selectedTemplate'

// Draft
const [resumeId, setResumeId] = useState<string | null>(null);
const [isLoadingDraft, setIsLoadingDraft] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle');

// Submission
const [status, setStatus] = useState<'analyzing'|'success'|'error'|null>(null);

// Skills generation
const [skillsGenerated, setSkillsGenerated] = useState(false);
const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
const [lastGeneratedRole, setLastGeneratedRole] = useState('');
const [lastGeneratedIndustry, setLastGeneratedIndustry] = useState('');
```

#### Step Definitions

```typescript
const STEPS = [
  'Personal Info',   // 0 — required
  'Education',       // 1 — required
  'Experience',      // 2 — optional
  'Skills',          // 3 — optional (but AI-enhanced)
  'Summary',         // 4 — required (100-500 chars)
  'Additional',      // 5 — optional
];
```

#### Validation Logic

```
Step 0 (Personal Info):
  Required: fullName, email, phone, city, country,
            targetRole, targetIndustry, targetCountry

Step 1 (Education):
  Required: ≥1 entry where all of:
    degreeType, major, university, graduationDate are non-empty

Step 4 (Summary):
  Required: professionalSummary.length between 100 and 500

Steps 2, 3, 5: no required fields — always pass validation
```

---

### 4.2 Form Steps

#### Step 0 — Personal Info
**File:** `client/src/components/resume-builder/steps/PersonalInfoStep.tsx`

| Section | Fields |
|---|---|
| Profile Photo | File upload (2MB limit, JPEG/PNG), Base64-encoded, conditional on `SUPPORTS_PHOTO[selectedTemplate]` |
| Contact Details | fullName*, email*, phone*, city*, country* |
| Target Position | targetRole*, targetIndustry* (13-option dropdown), targetCountry*, targetCity |
| Professional Links | linkedinUrl, portfolioUrl, additionalLinks[] (up to 3, each: label + url) |

`*` = required field

#### Step 1 — Education
**File:** `client/src/components/resume-builder/steps/EducationStep.tsx`

Multiple entries. Per entry:

| Field | Required |
|---|---|
| Degree Type | Yes |
| Major / Field of Study | Yes |
| University | Yes |
| Graduation Date | Yes |
| GPA | No |
| Honors | No |
| Relevant Coursework | No (textarea) |

"+ Add Education" button; "Remove" hides when only 1 entry.

#### Step 2 — Experience
**File:** `client/src/components/resume-builder/steps/ExperienceStep.tsx`

**Optional for fresh graduates.** Multiple entries. Per entry:

| Field | Notes |
|---|---|
| Type | Dropdown: internship / part-time / full-time / freelance / volunteer |
| Company / Organization | Text |
| Industry | Optional text |
| Role | Text |
| Duration | Text (e.g. "Jun 2023 – Aug 2023") |
| Key Responsibilities | **RichTextEditor** — markdown toolbar (bold, italic, bullet, numbered list); supports `**bold**`, `*italic*`, `• bullet` syntax |

#### Step 3 — Skills
**File:** `client/src/components/resume-builder/steps/SkillsStep.tsx`

Three sub-sections:

**Technical Skills**
- AI suggestion buttons (clickable, toggle to green check when added)
- Custom input with "Add" button (Enter key also submits)
- Stored as `skills.technical: [{ category, items[] }]`

**Soft Skills**
- 10 hardcoded toggles: Communication, Teamwork, Problem Solving, Leadership, Time Management, Adaptability, Critical Thinking, Creativity, Analytical Thinking, Attention to Detail
- Stored as `skills.soft: string[]`

**Languages**
- Per-language: text input + proficiency dropdown (native / fluent / professional / intermediate / basic)
- Stored as `skills.languages: [{ language, proficiency }]`

#### Step 4 — Summary
**File:** `client/src/components/resume-builder/steps/SummaryStep.tsx`

- Textarea (6 rows)
- Character limit: 100 min / 500 max
- "Generate with AI" button:
  - Sends: targetRole, targetIndustry, targetCountry, education (condensed), experience (condensed), projects (top 3), technical skills (top 10)
  - Receives: `{ summary: string }` (100–150 words)
  - Confirmation dialog if summary already filled

#### Step 5 — Additional
**File:** `client/src/components/resume-builder/steps/AdditionalStep.tsx`

| Sub-section | Type |
|---|---|
| Projects | Multiple entries (name, role, technologies, link, description) via `ProjectsStep.tsx` |
| Certifications | Textarea (3 rows) |
| Extracurricular Activities | Textarea (3 rows) |

---

### 4.3 Live Preview

**File:** `client/src/components/live-preview/ResumePreview.tsx`

- Wrapped in `React.memo()` — only re-renders when `debouncedFormData` changes
- Layout: 816px wide sizer (8.5in × 96dpi) with `transform: scale(zoom)` from top-left
- Renders `ResumeTemplateSwitcher` which maps `templateId → TemplateComponent`
- Zoom controls: −, %, +, Fit buttons
- "Choose Template" button opens `TemplateSwitcher` modal

**Desktop layout (≥ lg):** Right preview column is a sibling of the left form column — both are direct children of the outer flex-row wrapper. The preview spans the full viewport height from immediately below the app navbar (no header above it). The "Build Your Resume" header and Save Draft button live only in the left column.

**Mobile layout (< lg):** Full-width stacked layout with a tab switcher (Edit / Preview) below the header.

**Debounce:**
```typescript
const debouncedFormData = useDebounce(formData, 300);
// Only the debounced value is passed to ResumePreview
// Raw formData updates immediately (for form inputs)
```

---

### 4.4 Template System

**7 available templates** (stored as `TemplateId` union type):

| TemplateId | Category | Layout | Photo | Default |
|---|---|---|---|---|
| `modern` | Modern | Single-column centered header, Inter font | Yes | ✓ (sort_order=0) |
| `modern_yellow_split` | Modern | 2-col yellow split | Yes | |
| `dark_ribbon_modern` | Modern | 2-col dark sidebar, ribbon headers | Yes | |
| `modern_minimalist_block` | Modern | 2-col dark sidebar, block section headers | Yes | |
| `editorial_earth_tone` | Modern | 2-col vertical dark pill sidebar, earth tones | Yes | |
| `ats_clean` | ATS | Single-column, no sidebar, white bg | No | |
| `ats_lined` | ATS | Single-column, no sidebar, navy border-bottom h2 | No | |

> **Removed:** `warm_creative`, `sleek_director`, `modern_minimal`, `creative_bold`, `professional_classic`, `tech_focused`, `healthcare_pro`

**Category tabs in TemplateSwitcher:** All, Modern, ATS (Creative and Professional tabs removed)

**`SUPPORTS_PHOTO` constant** (in `ResumeBuilderPage.tsx`):
```typescript
const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern: true,
  modern_yellow_split: true,
  dark_ribbon_modern: true,
  modern_minimalist_block: true,
  editorial_earth_tone: true,
  // ats_clean and ats_lined: NOT in map → false
};
```

**Key files:**
- `client/src/components/templates/types.ts` — `TemplateId` union (7 values) + `ResumeTemplateProps`
- `client/src/components/templates/ResumeTemplateSwitcher.tsx` — maps id → component, fallback to `ModernTemplate`
- Each template: `client/src/components/templates/[Name]Template.tsx` (inline styles only, no Tailwind)
- `client/src/components/live-preview/templateTypes.ts` — `getAllTemplates()`, `getTemplate()`; includes `thumbnailUrl: '/thumbnails/{id}.png'`

**Template persistence:**
```typescript
// On select:
localStorage.setItem('resumeBuilder_selectedTemplate', templateId);
// On mount (VALID_TEMPLATE_IDS checked before restoring):
localStorage.getItem('resumeBuilder_selectedTemplate') || 'modern';
```

---

### 4.5 Draft Management

**Save draft:**
```typescript
// Button: "Save Draft"
const result = await saveDraft(formData, resumeId || undefined);
if (result.resumeId && !resumeId) setResumeId(result.resumeId);
setSaveStatus('saved'); // → resets to 'idle' after 2s
```

**Load draft (on mount if URL has ?id=):**
```typescript
const draft = await loadDraftApi(urlId);
setFormData(draft.formData);
setResumeId(draft.resumeId);
// Auto-mark steps as completed:
if (draft.formData.fullName) completedSteps.add(0);
if (draft.formData.education?.length) completedSteps.add(1);
// etc.
```

**Unsaved changes warning:**
```typescript
useEffect(() => {
  if (!hasUnsavedChanges) return;
  const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}, [hasUnsavedChanges]);
```

---

### 4.6 API Calls from Client

**File:** `client/src/utils/api.ts` (axios instance, `baseURL: '/api'`, `withCredentials: true`)

```typescript
// Build resume (final submit)
buildResume(formData)
  → POST /api/resume/build
  → Body: { ...ResumeFormData, templateId: string }
  → Returns: { resume: { id, target_role, match_percentage, ... } }

// Draft operations
saveDraft(formData, resumeId?)
  → POST /api/resume/draft/save
  → Body: { formData, resumeId? }
  → Returns: { success, resumeId, message }

loadDraft(id)
  → GET /api/resume/draft/:id
  → Returns: { resumeId, formData: ResumeFormData, updatedAt }

// AI generation
apiClient.post('/ai/generate-skills', { targetRole, targetIndustry })
  → Returns: { technical: [{category, items[]}], soft: [], languages: [] }

apiClient.post('/ai/generate-summary', {
  targetRole, targetIndustry, targetCountry,
  education, experience, projects, skills
})
  → Returns: { summary: string }

// Template-aware PDF export (client-side render → server PDF)
exportPdfWithTemplate(templateId, formData)
  → 1. Render ResumeTemplateSwitcher to hidden DOM div
  → 2. Extract innerHTML as HTML string
  → 3. POST /api/export/pdf-from-html { html }
  → 4. Receive PDF blob → browser download

// Cover letter (v3 — multiple per resume; keyed by letter UUID)
POST /api/cover-letter/extract-keywords  { resumeId?, resumeText?, jobDescription }
  → Returns: { keywords: { matched: string[], missing: string[] } }

POST /api/cover-letter/generate
  { resumeId?, resumeText?, jobTitle, companyName, jobDescription,
    tone?, wordCountTarget?, keywords?, whyThisCompany?, achievementToHighlight? }
  → Returns: { letter: CoverLetter }

GET  /api/cover-letter/                    → Returns: { letters: CoverLetter[] }
GET  /api/cover-letter/resume/:resumeId    → Returns: { letters: CoverLetter[] }
GET  /api/cover-letter/:id                 → Returns: { letter: CoverLetter }
PUT  /api/cover-letter/:id  { content }    → Returns: { letter: CoverLetter }
DELETE /api/cover-letter/:id               → Returns: { message }
POST /api/cover-letter/:id/regenerate      → Returns: { letter: CoverLetter }
POST /api/cover-letter/:id/improve         → Returns: { letter: CoverLetter }
```

---

## 5. Backend

### 5.1 Routes

**File:** `server/src/routes/resume/index.ts`

All routes require `isAuthenticated` middleware.

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/api/resume/` | `listResumes` | Dashboard list |
| POST | `/api/resume/build` | `buildResume` | **Path B submit** |
| POST | `/api/resume/draft/save` | `saveDraft` | Create/update draft |
| GET | `/api/resume/draft/:id` | `loadDraft` | Load draft form data |
| GET | `/api/resume/:id` | `getResume` | Full resume + form_data |
| DELETE | `/api/resume/:id` | `deleteResume` | Delete + file cleanup |
| GET | `/api/resume/:id/file` | `getResumeFile` | Serve PDF (Path A only) |
| POST | `/api/resume/:id/switch-template` | `switchTemplate` | Change template |

**Health route** (no auth, no rate limit):

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | DB ping + latency check; used by client ConnectivityProvider |

**AI routes** (`server/src/routes/ai/`), behind `aiLimiter` (10 req/15min):

| Method | Path | Handler |
|---|---|---|
| POST | `/api/ai/generate-skills` | `generateSkillsHandler` |
| POST | `/api/ai/generate-summary` | `generateSummaryHandler` |

**Export routes** (`server/src/routes/export/`):

| Method | Path | Handler |
|---|---|---|
| GET | `/api/export/pdf/:resumeId` | `exportPdf` |
| GET | `/api/export/markdown/:resumeId` | `exportMarkdown` |
| POST | `/api/export/pdf-from-html` | `exportPdfFromHtml` |

**Cover letter routes** (`server/src/routes/coverLetter/`), behind `aiLimiter`:

| Method | Path | Handler |
|---|---|---|
| POST | `/api/cover-letter/extract-keywords` | `extractKeywords` |
| POST | `/api/cover-letter/generate/:resumeId` | `generateCoverLetter` |
| GET | `/api/cover-letter/:resumeId` | `getCoverLetter` |
| PUT | `/api/cover-letter/:resumeId` | `updateCoverLetter` |
| DELETE | `/api/cover-letter/:resumeId` | `deleteCoverLetter` |
| GET | `/api/cover-letter/` | `listCoverLetters` |

**Auth routes** (`server/src/routes/auth/`):

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | Creates user (unverified), sends verification email |
| POST | `/api/auth/login` | Rejects if `is_email_verified = false` |
| POST | `/api/auth/logout` | Destroys session |
| GET | `/api/auth/me` | Returns current user |
| GET | `/api/auth/verify-email` | Verifies token, marks user verified |
| POST | `/api/auth/forgot-password` | Rate-limited (5/hr); sends reset email |
| POST | `/api/auth/reset-password` | Validates token, updates password |

---

### 5.2 Middleware & Validation

**`server/src/middleware/auth.ts`**
```typescript
isAuthenticated(req, res, next):
  if req.isAuthenticated() → next()
  else → 401 { error: 'Authentication required' }
```

**`server/src/middleware/validators/resumeValidators.ts`**

`buildResumeValidators` (applied to POST /api/resume/build):
- `fullName` — required, non-empty string
- `email` — required, valid email format
- `phone` — required, non-empty string
- `targetRole` — required, non-empty string
- `targetCountry` — required, non-empty string
- `education` — required array, min 1 item
- `professionalSummary` — required, non-empty string

**`server/src/middleware/validate.ts`**
- Runs `validationResult(req)` from express-validator
- Returns `400 { errors: [...] }` if any fail

---

### 5.3 Resume Controller

**File:** `server/src/controllers/resumeController.ts`

#### `buildResume` (POST /api/resume/build)

```typescript
1. const userId = (req.user as any).id;
2. const rawFormData = req.body;
3. const transformedData = transformFormData(rawFormData);
   // Flatten skills: technical[].items → "Category: s1, s2; Cat2: s3"
   // Languages: { language, proficiency } → { name, proficiency }
4. const { resumeText, matchPercentage, aiAnalysis } =
     await generateResume(transformedData);
   // GPT-4o-mini generates complete resume text + analysis
5. const templateId = rawFormData.templateId || 'modern';
6. INSERT INTO resumes (user_id, parsed_text, target_role, target_country,
     target_city, match_percentage, ai_analysis, template_id)
7. INSERT INTO resume_data (resume_id, form_data)
   // form_data = rawFormData (frontend format, NOT transformed)
8. return 201 { resume }
```

**`transformFormData` helper:**
```typescript
// Input (frontend format):
skills.technical = [{ category: "Languages", items: ["Python", "JS"] }]
skills.soft = ["Communication", "Teamwork"]
skills.languages = [{ language: "English", proficiency: "fluent" }]

// Output (backend format):
technicalSkills = "Languages: Python, JS"
softSkills = ["Communication", "Teamwork"]
languages = [{ name: "English", proficiency: "fluent" }]
```

#### `saveDraft` (POST /api/resume/draft/save)

```typescript
if (resumeId exists in body):
  Verify resume belongs to user (404 if not)
  UPDATE resumes SET target_role, target_country, target_city, status='draft'
  UPSERT resume_data SET form_data = newFormData ON CONFLICT (resume_id)
else:
  INSERT INTO resumes (user_id, target_role, ..., status='draft',
    created_with_live_preview=true)
  INSERT INTO resume_data (resume_id, form_data)
  newResumeId = returned id
return { success: true, resumeId: newResumeId || existing }
```

#### `loadDraft` (GET /api/resume/draft/:id)

```typescript
SELECT r.id, r.updated_at FROM resumes r WHERE r.id = $1 AND r.user_id = $2
SELECT rd.form_data FROM resume_data rd WHERE rd.resume_id = $1
return { resumeId, formData, updatedAt }
```

#### `listResumes` (GET /api/resume/)

```typescript
SELECT id, target_role, target_country, target_city,
       match_percentage, ats_score, created_at
FROM resumes
WHERE user_id = $1
ORDER BY created_at DESC
```

---

### 5.4 AI Services

#### `resumeGenerator.ts` — Full Resume Generation

**File:** `server/src/services/ai/resumeGenerator.ts`

**Called by:** `buildResume` controller

**Input:**
```typescript
interface ResumeFormInput {
  fullName: string; email: string; phone: string;
  linkedinUrl?: string; portfolioUrl?: string;
  city: string; country: string;
  targetRole: string; targetCountry: string; targetCity?: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  technicalSkills: string;  // "Lang: Python, JS; DB: PostgreSQL"
  softSkills: string[];
  languages: LanguageEntry[];
  certifications?: string; extracurriculars?: string;
  professionalSummary: string;
}
```

**Process:**
1. Validates required fields (fullName, targetRole, targetCountry)
2. Formats data into a readable prompt
3. Calls GPT-4o-mini (temperature: 0.3, response_format: JSON)
4. System prompt: "expert resume writer, respond with JSON"
5. User prompt: Build complete resume text with Contact / Summary / Education / Experience / Projects / Skills sections; strong action verbs; ATS keywords; output match %, strengths, weaknesses, suggestions

**Output:**
```typescript
{
  resumeText: string;      // Complete resume as formatted text
  matchPercentage: number; // 0-100
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  }
}
```

---

#### `summaryGenerator.ts` — Professional Summary

**File:** `server/src/services/ai/summaryGenerator.ts`

**Called by:** AI route handler for `/api/ai/generate-summary`

**Input:**
```typescript
{
  targetRole: string; targetIndustry?: string; targetCountry: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: { technical: TechnicalSkillCategory[]; }
}
```

**Process:**
1. Validates targetRole + targetCountry
2. Condenses context: top education entry, positions/companies, top 3 projects, top 10 technical skills
3. Calls GPT-4o-mini (temperature: 0.4, max_tokens: 300)
4. Asks for 2–3 sentences covering: education + qualifications, experience + skills, career goals

**Output:** `{ summary: string }` (trimmed, minimum 50 chars)

---

#### `skillsGenerator.ts` — Skills Suggestions

**File:** `server/src/services/ai/skillsGenerator.ts`

**Called by:** AI route handler for `/api/ai/generate-skills`

**Caching strategy:**
```
Cache key: "skills_v2:{targetRole.toLowerCase()}:{targetIndustry.toLowerCase()}"
Table: ai_cache (expires_at = NOW() + 30 days)
On hit: return parsed JSON immediately (no GPT call)
On miss: call GPT → parse → UPSERT ai_cache → return
```

**GPT prompt asks for:**
- Technical: 2–3 categories, 4–5 specific tools/technologies each
- Soft: 2–3 (excludes generic ones like Communication, Teamwork that are in the hardcoded list)
- Languages: usually just English

**Output:**
```typescript
{
  technical: [{ category: string; items: string[] }];
  soft: string[];
  languages: [{ language: string; proficiency: string }];
}
```

**Frontend handling:**
```typescript
// Flatten all technical items + languages → max 15 skill suggestions
const suggestions = [
  ...response.technical.flatMap(cat => cat.items),
  ...response.languages.map(l => l.language)
].slice(0, 15);
```

---

### 5.5 Export Services

#### Template-Aware PDF Export (Primary for Path B)

**Flow:**
```
Client side:
  exportPdfWithTemplate(templateId, formData)
  1. flushSync(() => createRoot(div).render(<ResumeTemplateSwitcher .../>))
  2. html = div.innerHTML (inline styles, no Tailwind needed)
  3. POST /api/export/pdf-from-html { html }

Server side (exportController.exportPdfFromHtml):
  generatePdf(html, { margins: false })
  → Puppeteer: launch → setContent → pdf({ format:'A4', printBackground:true, margin: 0 })
  → Return PDF buffer
```

**File:** `server/src/services/export/pdfGenerator.ts`

```typescript
generatePdf(html: string, opts?: { margins?: boolean }): Promise<Buffer>
// opts.margins === false → zero margins (template owns all spacing)
// default → 0.75in on all sides
```

#### Legacy PDF Export (Fallback)

**File:** `server/src/services/export/htmlTemplate.ts`

```typescript
buildResumeHtml({ formData?, parsedText?, targetRole? })
// If formData → buildStructuredBody() → formatted HTML with sections
// If parsedText → buildPlainBody() → <pre>-wrapped plain text
```

Used by `GET /api/export/pdf/:resumeId` (non-template-aware).

---

## 6. Database Schema

### `resumes` table

```sql
CREATE TABLE resumes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path        VARCHAR(500),    -- NULL for Path B (no uploaded file)
  parsed_text      TEXT,            -- AI-generated resume text (Path B)
  target_role      VARCHAR(255),
  target_country   VARCHAR(100),
  target_city      VARCHAR(100),
  job_description  TEXT,            -- Optional JD (migration 018)
  match_percentage INTEGER,
  ai_analysis      JSONB,           -- { strengths, weaknesses, suggestions,
                                    --   atsBreakdown?, improvements? }
  ats_score        INTEGER,         -- Cached ATS total score (nullable)
  template_id      VARCHAR(50) DEFAULT 'modern_yellow_split',
  status           VARCHAR(20) DEFAULT 'draft',
  created_with_live_preview BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `resume_data` table

```sql
CREATE TABLE resume_data (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id  UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  form_data  JSONB NOT NULL,   -- Raw frontend ResumeFormData (preserved as-is)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_resume_data_resume_id ON resume_data(resume_id);
```

> **Note:** `form_data` stores the **raw frontend format** (nested skills structure) — NOT the transformed backend format. This allows the frontend to reconstruct the exact form state.

### `cover_letters` table (migration 022)

```sql
CREATE TABLE cover_letters (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id            UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content              TEXT NOT NULL,           -- Current (possibly edited) content
  generated_content    TEXT NOT NULL,           -- Original AI-generated content (for revert)
  tone                 VARCHAR(50),             -- professional / enthusiastic / formal / conversational
  word_count_target    VARCHAR(20),             -- short / medium / long
  company_name         VARCHAR(255),
  hiring_manager_name  VARCHAR(255),
  custom_instructions  TEXT,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id)                             -- one cover letter per resume
);
```

### `email_verification_tokens` table (migration 020)

```sql
CREATE TABLE email_verification_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `password_reset_tokens` table (migration 021)

```sql
CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

> **`users` table additions (migration 020):** `name VARCHAR(255)`, `is_email_verified BOOLEAN DEFAULT FALSE`. Existing users are marked verified on migration.

### `ai_cache` table (migration 005)

```sql
CREATE TABLE ai_cache (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key  VARCHAR(500) UNIQUE NOT NULL,
  data       JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Used by `skillsGenerator` with 30-day TTL.

### `analysis_history` table (migration 019)

```sql
CREATE TABLE analysis_history (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id        UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role      VARCHAR(255),
  job_description  TEXT,
  match_percentage INTEGER,
  ai_analysis      JSONB,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_analysis_history_resume_id ON analysis_history(resume_id);
```

---

## 7. Data Structures

### `ResumeFormData` (frontend)

**File:** `client/src/types/index.ts`

```typescript
interface ResumeFormData {
  // Step 0: Personal
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[];   // max 3
  profilePhoto?: string;               // Base64 image (template-conditional)
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
  targetIndustry: string;

  // Step 1: Education
  education: Education[];

  // Step 2: Experience
  experience: Experience[];

  // Step 3: Skills
  skills: {
    technical: TechnicalSkillCategory[];
    soft: string[];
    languages: LanguageSkill[];
  };

  // Step 4: Summary
  professionalSummary: string;

  // Step 5: Additional
  projects: Project[];
  certifications?: string;
  extracurriculars?: string;
}
```

### Supporting Types

```typescript
interface Education {
  degreeType: string;
  major: string;
  university: string;
  graduationDate: string;
  gpa?: string;
  relevantCoursework: string;
  honors?: string;
}

interface Experience {
  type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
  company: string;
  role: string;
  duration: string;          // e.g. "Jun 2023 – Aug 2023"
  responsibilities: string;  // Textarea text
  industry?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;      // Comma-separated
  role: string;
  link?: string;
}

interface TechnicalSkillCategory {
  category: string;
  items: string[];
}

interface LanguageSkill {
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}

interface AdditionalLink {
  id: string;
  label: string;
  url: string;
}
```

---

## 8. AI Feature Deep-Dives

### 8.1 Resume Generation (GPT-4o-mini)

The `generateResume()` call in `buildResume` produces three things simultaneously:
1. **Full resume text** — formatted with section headers, bullet points, action verbs
2. **Match percentage** (0–100) — how well the resume matches the target role/country
3. **AI analysis** — strengths[], weaknesses[], suggestions[]

This is stored in the `resumes` table and drives the analysis page shown after submission.

### 8.2 Skills Generation

**Caching:** Skills are cached in PostgreSQL for 30 days per (role, industry) combination. This means:
- First user to request "Software Engineer + Tech" pays the GPT cost
- All subsequent requests (same role + industry) get instant cached results
- Cache key is lowercase normalized: `"skills_v2:software engineer:tech"`

**Exclusion list:** The AI is explicitly told NOT to suggest these soft skills (they're handled by hardcoded UI toggles): Communication, Teamwork, Problem-Solving, Leadership, Time Management, Adaptability, Critical Thinking, Creativity, Analytical Thinking, Attention to Detail.

**Regeneration:** Users can click "Regenerate" in SkillsStep to force a new API call (not cache-busted, just re-fetches and may return cached result).

### 8.3 Summary Generation

- Temperature 0.4 (slightly higher than skills/resume for more variation)
- max_tokens: 300 (keeps it concise)
- Context condensed before sending: only top education, company names (no full descriptions), top 3 projects, top 10 technical skills
- Minimum 50 chars validation server-side; client validates 100–500 chars

---

## 9. Export System

### Template-Aware PDF (Primary)

This is the main export path for Path B resumes. The key insight is that **rendering happens client-side** using React, then the HTML is sent to the server for Puppeteer to PDF-ize.

```
Why client-side render?
  Templates use React components with inline styles.
  Server doesn't have React — it only has Puppeteer.
  Solution: render on client → send HTML → Puppeteer prints it.
```

**Template CSS constraint:** All template components must use `width: '100%'` and `minHeight: '100%'` on their outermost div. `ResumePreview.tsx` sets the `8.5in` width container; the template fills it.

### Legacy PDF Export

`GET /api/export/pdf/:resumeId` uses `buildResumeHtml()` from `htmlTemplate.ts` — a plain HTML/CSS resume layout. This is used as a fallback or for resumes where the template isn't needed.

### Markdown Export

`GET /api/export/markdown/:resumeId` — calls `generateMarkdown()` service to produce a `.md` file from the same data.

---

## 10. Error Handling & Security

### Rate Limiting

| Limiter | Applies to | Limit |
|---|---|---|
| `aiLimiter` | `/api/ai/*`, `/api/analysis/*`, `/api/cover-letter/*` | 10 req / 15 min |
| `apiLimiter` | General API | 100 req / 15 min |
| `authLimiter` | `/api/auth/*` | 20 req / 15 min |

### Prompt Injection Defense

All user-supplied text passed to GPT is sanitized via `sanitizePromptInput()` from `server/src/utils/sanitizePromptInput.ts`. This is applied to job descriptions and resume text before AI calls.

### Validation Flow

```
Request arrives at /api/resume/build
  → isAuthenticated middleware (401 if not logged in)
  → buildResumeValidators[] (express-validator rules)
  → validate middleware (returns 400 with errors array if any fail)
  → buildResume controller (only reached if all pass)
```

### Controller Error Pattern

Every controller follows:
```typescript
export const buildResume = async (req, res, next) => {
  try {
    // ... logic
  } catch (err) {
    next(err); // delegated to errorHandler middleware
  }
};
```

### File Size Limits

- Express JSON body limit: `10mb` (needed for Base64 photo HTML payloads in PDF export)
- Multer file limit: `10mb` (for PDF uploads, Path A only)
- Profile photo: client-side 2MB validation before Base64 encoding

---

## 11. Testing

### Backend Tests

**File:** `server/src/controllers/__tests__/resumeController.test.ts`

- Uses Jest + ts-jest + supertest
- Mocks: `../../config/openai`, `../../config/db`, `../../services/ai/resumeGenerator`, `../../services/ai/skillsGenerator`, `../../services/ai/summaryGenerator`
- Run: `node --experimental-vm-modules ./node_modules/jest/bin/jest.js`
- Windows note: `beforeEach` cleanup uses `try-catch` around `fs.unlinkSync` to ignore `EBUSY` errors

### Frontend Tests

**File:** `client/src/pages/__tests__/ResumeBuilderPage.test.tsx`

- Uses Vitest + jsdom + @testing-library/react
- `vi.clearAllTimers()` required in `beforeEach`
- 15000ms timeout on navigation tests (live preview rendering is slow on Windows)
- Requires `--pool=threads` for complex test files: `vitest --pool=threads`

**Step component tests:**
- Controlled inputs need stateful `Wrapper` component: `const [data, setData] = useState(initial); return <Step data={data} onChange={setData} />;`
- Use `userEvent.type()` for realistic typing simulation

### Known Pre-existing Test Failures

- `summaryGenerator.test.ts` — pre-existing
- `skillsGenerator.test.ts` — pre-existing
- `FormSteps.test.tsx > SkillsStep > shows AI-generated skills banner` — pre-existing
- `CoverLetterPage.test.tsx` — mock objects missing `keywords`, `progressStep`, `savedIndicator`, `reset` from updated `UseCoverLetterReturn` type
- `useCoverLetter.test.ts` — uses outdated `GenerateCoverLetterPayload` shape and old return type

---

## 12. Key File Index

### Frontend

| File | Purpose |
|---|---|
| `client/src/pages/ResumeBuilderPage.tsx` | Main page: state, steps, submit, draft, template |
| `client/src/components/resume-builder/steps/PersonalInfoStep.tsx` | Step 0 — personal info + target position |
| `client/src/components/resume-builder/steps/EducationStep.tsx` | Step 1 |
| `client/src/components/resume-builder/steps/ExperienceStep.tsx` | Step 2 |
| `client/src/components/resume-builder/steps/SkillsStep.tsx` | Step 3 |
| `client/src/components/resume-builder/steps/SummaryStep.tsx` | Step 4 |
| `client/src/components/resume-builder/steps/AdditionalStep.tsx` | Step 5 |
| `client/src/components/resume-builder/steps/ProjectsStep.tsx` | Projects sub-section (Step 5) |
| `client/src/components/resume-builder/RichTextEditor.tsx` | Markdown toolbar textarea used in Experience + Projects steps |
| `client/src/components/resume-builder/StepIndicator.tsx` | Progress bar with clickable steps |
| `client/src/components/shared/ConfirmLeaveModal.tsx` | "Leave page?" guard used with `useBlocker` |
| `client/src/components/shared/ServerDownBanner.tsx` | Sticky alert when server unreachable |
| `client/src/contexts/AuthContext.tsx` | Global auth state (`useAuthContext()`) |
| `client/src/contexts/ThemeContext.tsx` | Dark/light mode (`useTheme()`) |
| `client/src/contexts/ConnectivityContext.tsx` | Server health monitoring (`useConnectivity()`) |
| `client/src/pages/ThumbnailPreviewPage.tsx` | Template renderer for Puppeteer screenshot script |
| `client/src/lib/utils.ts` | `cn()` — Tailwind class merging utility |
| `client/src/components/ui/` | Primitive components: Button, Input, Label, Select, Textarea |
| `client/src/components/live-preview/ResumePreview.tsx` | Live preview panel |
| `client/src/components/templates/ResumeTemplateSwitcher.tsx` | templateId → component map |
| `client/src/components/templates/types.ts` | `TemplateId` union (7 values) + `ResumeTemplateProps` |
| `client/src/components/live-preview/templateTypes.ts` | `getAllTemplates()`, `getTemplate()` — includes `thumbnailUrl` |
| `client/src/types/index.ts` | `ResumeFormData` + all sub-types |
| `client/src/utils/api.ts` | `buildResume()`, `saveDraft()`, `loadDraft()`, `exportPdfWithTemplate()` |
| `client/src/pages/CoverLetterPage.tsx` | Cover letter generator UI (standalone + attached-to-resume modes) |
| `client/src/hooks/useCoverLetter.ts` | Cover letter state: `generate`, `save`, `reset`, `keywords`, `progressStep`, `savedIndicator` |
| `client/e2e/` | Playwright E2E tests |
| `client/playwright.config.ts` | Playwright config (Chromium, port 5173, 1 worker) |

### Backend

| File | Purpose |
|---|---|
| `server/src/routes/resume/index.ts` | All /api/resume/* route definitions |
| `server/src/routes/export/index.ts` | All /api/export/* route definitions |
| `server/src/controllers/resumeController.ts` | buildResume, saveDraft, loadDraft, listResumes, deleteResume |
| `server/src/controllers/exportController.ts` | exportPdf, exportPdfFromHtml, exportMarkdown |
| `server/src/controllers/analysisController.ts` | getMatchPercentage, getAtsScore, getImprovements, reanalyze |
| `server/src/services/ai/resumeGenerator.ts` | generateResume() — GPT-4o-mini full resume + analysis |
| `server/src/services/ai/summaryGenerator.ts` | generateSummary() — GPT-4o-mini 100-150 word summary |
| `server/src/services/ai/skillsGenerator.ts` | generateSkills() — with 30-day ai_cache caching |
| `server/src/services/export/pdfGenerator.ts` | generatePdf() — Puppeteer A4 PDF |
| `server/src/services/export/htmlTemplate.ts` | buildResumeHtml() — legacy HTML layout |
| `server/src/middleware/auth.ts` | isAuthenticated middleware |
| `server/src/middleware/validators/resumeValidators.ts` | buildResumeValidators, resumeValidators |
| `server/src/app.ts` | Express setup, middleware, route registration |
| `server/src/migrations/003_create_resumes.ts` | resumes table |
| `server/src/migrations/004_create_resume_data.ts` | resume_data table |
| `server/src/migrations/005_add_live_preview_columns.ts` | status, template_id, ai_cache table |
| `server/src/utils/sanitizePromptInput.ts` | Prompt injection defense |
| `server/src/controllers/coverLetterController.ts` | `generateCoverLetter`, `extractKeywords`, `getCoverLetter`, `updateCoverLetter`, `deleteCoverLetter`, `listCoverLetters` |
| `server/src/services/ai/coverLetterGenerator.ts` | `generateCoverLetter()` — GPT-4o-mini, temp 0.7 |
| `server/src/services/ai/keywordExtractor.ts` | `extractKeywords()` — GPT-4o-mini, temp 0.3, JSON mode |
| `server/src/routes/coverLetter/` | All `/api/cover-letter/*` route definitions |
| `server/src/migrations/022_create_cover_letters.ts` | `cover_letters` table |
| `server/src/migrations/023_remove_deleted_templates.ts` | Removes 5 legacy template rows |
| `server/src/migrations/024_remove_warm_creative_sleek_director.ts` | Removes `warm_creative` + `sleek_director` |
| `server/src/migrations/025_add_ats_templates.ts` | Adds `ats_clean` + `ats_lined`; re-categorizes `modern_yellow_split` + `editorial_earth_tone` |
| `server/src/migrations/026_add_modern_template.ts` | Adds `modern` template (sort_order=0, default) |
| `server/src/migrations/027_alter_cover_letters_multiple.ts` | Drops `UNIQUE(resume_id)`, adds `job_title` column |
| `server/src/migrations/028_allow_null_resume_id_cover_letters.ts` | Makes `resume_id` nullable (standalone letters) |
| `server/src/migrations/029_update_template_thumbnails.ts` | Sets `thumbnail_url` for all 7 templates |
| `server/src/scripts/generate-thumbnails.ts` | Puppeteer script to screenshot all templates → PNG files |

---

## Verification

After implementation or changes, verify end-to-end:

1. **Start servers:** `cd server && npm run dev` + `cd client && npm run dev`
2. **Register + verify email** → login
3. **Navigate to /build** → complete all 6 steps
4. **Step 3:** Confirm skills suggestions appear automatically
5. **Step 4:** Use "Generate with AI" button → confirm summary appears
6. **Save Draft** → reload page with URL `?id=<resumeId>` → confirm data persists
7. **Submit** → confirm redirect to `/resume/:id` with match percentage
8. **Export PDF** → confirm download with correct template
9. **Run tests:**
   - `cd server && npm test`
   - `cd client && npm test -- --pool=threads`
