# Resume Builder from Scratch — Complete Feature Documentation

> Current as of codebase state: March 2026. Covers Path B (builder form) and Path A (PDF upload). 7 templates, draft saving, template-aware PDF export.

---

## 1. Feature Overview

### Two Paths
| Path | Entry | Description |
|------|-------|-------------|
| **Path B — Builder** | `/build` or `/build/:id` | 6-step multi-form; live preview; AI-assisted skills + summary generation; template selection; PDF export |
| **Path A — Upload** | `/upload` (redirects to dashboard; upload widget on dashboard) | Upload existing PDF; AI analysis; ATS scoring; improvement suggestions |

> Path A (AI analysis) is soft-disabled in production UI — code and routes are preserved but entry points are hidden. This document focuses on Path B.

### User Flow (Path B — happy path)
1. Click **Build New Resume** on dashboard → `/build`
2. Complete 6 steps: Personal Info → Education → Experience → Skills → Summary → Projects
3. Real-time live preview updates on every keystroke (300ms debounce)
4. Choose template from template switcher (7 options)
5. Optional: auto-generate skills from target role + industry
6. Optional: auto-generate professional summary
7. Click **Finish & Preview** → validate → click **Save Resume**
8. Click **Export PDF** → Puppeteer renders template → downloads PDF

### Key Business Rules
- **Draft auto-save**: `POST /api/resume/draft/save` stores incremental state; loads on revisit via URL `?id=<resumeId>`
- **Unsaved changes guard**: `useBlocker` prevents navigation + `beforeunload` event fires when form has changes
- **Template-aware PDF**: React template component renders to HTML → Puppeteer → A4 PDF (zero margins)
- **Photo support**: `SUPPORTS_PHOTO` constant maps templateId → boolean; base64 image stored in `form_data`
- **ATS vs. Modern templates**: ATS templates (`ats_clean`, `ats_lined`) are single-column, no sidebar, no photo
- **Skills AI generation**: triggered on step advance when targetRole + targetIndustry set
- **Summary AI generation**: on-demand button on Summary step

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Routing | React Router v6 `createBrowserRouter` with `useBlocker` |
| Live Preview | React template components rendered client-side |
| Rich text (responsibilities) | Custom bullet-point textarea |
| Backend | Node.js, Express 4, TypeScript |
| AI | OpenAI GPT-4o-mini |
| PDF Generation | Puppeteer (headless Chrome via `pdf-puppeteer` or direct Puppeteer) |
| File Storage | Cloudinary (for Path A uploaded PDFs) |
| PDF Parsing | pdf-parse v2 (`pdfjs-dist`) |
| Database | PostgreSQL, raw `pg` pool |
| Auth | Passport.js session-based |

---

## 3. Frontend — ResumeBuilderPage

**File:** `client/src/pages/ResumeBuilderPage.tsx`

### Step Labels

```typescript
const STEP_LABELS = ['Personal Info', 'Education', 'Experience', 'Skills', 'Summary', 'Additional'];
// Index:              0               1            2             3         4           5
```

### Key State Variables

```typescript
const [currentStep, setCurrentStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
const [formData, setFormData] = useState<ResumeFormData>(INITIAL_FORM_DATA);
const [debouncedFormData, setDebouncedFormData] = useState<ResumeFormData>(INITIAL_FORM_DATA);
const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
const [resumeId, setResumeId] = useState<string | null>(null);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [isFinished, setIsFinished] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [isExporting, setIsExporting] = useState(false);
const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
const [stepErrors, setStepErrors] = useState<string[]>([]);
const [skillsGenerated, setSkillsGenerated] = useState(false);
const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
const [skillsGenerationError, setSkillsGenerationError] = useState<string | null>(null);
```

### Valid Template IDs

```typescript
const VALID_TEMPLATE_IDS = [
  'modern', 'modern_yellow_split', 'dark_ribbon_modern',
  'modern_minimalist_block', 'editorial_earth_tone', 'ats_clean', 'ats_lined'
];

const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern: true,
  modern_yellow_split: true,
  dark_ribbon_modern: true,
  modern_minimalist_block: true,
  editorial_earth_tone: true,
  ats_clean: false,
  ats_lined: false,
};
```

### Key Handler Functions

```typescript
handleNext()          // validate current step → move forward
handleBack()          // move backward (no validation)
handleFinishPreview() // validate steps 0, 1, 4 → setIsFinished(true)
handleSaveResume()    // POST /api/resume/build → setResumeId → setHasUnsavedChanges(false)
handleSaveDraft()     // POST /api/resume/draft/save → persist incremental state
handleExportPdf()     // exportPdfWithTemplate(selectedTemplate, formData) → download
generateSkillsAutomatically()  // POST /api/ai/generate-skills
```

### Key Effects

| Effect | Trigger | Action |
|--------|---------|--------|
| Load template | `[]` | Read `selectedTemplate` from localStorage |
| Load draft | `[id param]` | `GET /api/resume/draft/:id` → restore formData + template |
| Debounce preview | `[formData]` | 300ms delay → `setDebouncedFormData` |
| Track unsaved | `[formData]` | `setHasUnsavedChanges(true)` on change |
| Beforeunload | `[hasUnsavedChanges, isFinished]` | Block page close if unsaved |
| Auto-generate skills | `[currentStep, targetRole, targetIndustry]` | When step ≥ 1 + role + industry set + not yet generated |

### Layout

```
┌─────────────────────────────────┬──────────────────────────────────────┐
│ Left Panel (45vw, collapsible)  │ Right Panel (flex fill)              │
│ ─ StepIndicator                 │ ─ ResumePreview (live)               │
│ ─ Step form component           │ ─ Zoom controls (0.5x – 1.5x)       │
│ ─ Back / Next buttons           │ ─ Template switcher button           │
│ ─ Save / Export buttons         │ ─ Export PDF button                  │
└─────────────────────────────────┴──────────────────────────────────────┘
```

Left panel collapses to 80px sidebar with vertical step indicator on desktop.

---

## 4. Form Steps

### Step 0: Personal Info (`PersonalInfoStep.tsx`)

**Required fields:** fullName, email, phone, city, country, targetRole, targetIndustry, targetCountry

**Optional fields:** linkedinUrl, portfolioUrl, additionalLinks (up to 3 × {label, url}), profilePhoto (base64, max 2MB), targetCity

**targetIndustry options (13):**
Technology, Marketing, Finance, Healthcare, Education, Design, Sales, Legal, Engineering, Consulting, Media, Operations, Other

**Photo:** Image crop modal; base64 stored in `form_data.profilePhoto`; only rendered in photo-supporting templates.

**Validation (step 0):**
```typescript
if (!formData.fullName?.trim()) errors.push('Full name is required');
if (!formData.email?.trim()) errors.push('Email is required');
if (!formData.phone?.trim()) errors.push('Phone is required');
if (!formData.city?.trim()) errors.push('City is required');
if (!formData.country?.trim()) errors.push('Country is required');
if (!formData.targetRole?.trim()) errors.push('Target role is required');
if (!formData.targetIndustry?.trim()) errors.push('Industry is required');
if (!formData.targetCountry?.trim()) errors.push('Target country is required');
```

---

### Step 1: Education (`EducationStep.tsx`)

**Per entry fields:** degreeType, major, university, graduationDate, gpa (optional), relevantCoursework, honors (optional)

**Minimum:** 1 entry required

**graduationDate format:** Stored as `"2024-01"` (YYYY-MM); displayed as `"Jan 2024"` via month picker.

**Validation (step 1):**
```typescript
if (education.length === 0) errors.push('At least one education entry required');
// Each entry: degreeType, major, university, graduationDate required
```

---

### Step 2: Experience (`ExperienceStep.tsx`)

**Per entry fields:**
- `type`: `'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer'`
- `company`, `role`, `duration` (e.g., "Jun 2023 – Aug 2023" or "Present")
- `responsibilities` (bullet-point text)
- `industry` (optional)

**No minimum** — experience can be empty (fresh graduates may have none).

---

### Step 3: Skills (`SkillsStep.tsx`)

**Sub-sections:**
- `skills.technical`: `TechnicalSkillCategory[]` — up to 5 categories, each with `{category: string, items: string[]}`
- `skills.soft`: `string[]` — individual soft skills
- `skills.languages`: `LanguageSkill[]` — `{language, proficiency: 'native'|'fluent'|'professional'|'intermediate'|'basic'}`

**AI generation:** When `isGenerating` prop true, shows spinner + "Generating skills..." overlay. Error shown if fails. `onRegenerate` callback allows manual re-trigger.

**Language proficiency colors:** emerald (native), blue (fluent), cyan (professional), amber (intermediate), zinc (basic)

---

### Step 4: Summary (`SummaryStep.tsx`)

**Field:** `professionalSummary` — 100–500 chars

**AI generation button:** calls `POST /api/ai/generate-summary` with targetRole, targetIndustry, education, experience, projects, skills.

**Character counter:** red < 100, green 100–500, gray > 500.

**Validation (step 4):**
```typescript
if (!formData.professionalSummary?.trim()) errors.push('Professional summary is required');
if (formData.professionalSummary.length < 100) errors.push('Summary must be at least 100 characters');
```

---

### Step 5: Additional / Projects (`AdditionalStep.tsx`)

**Per entry fields:** name, description, technologies, role, link (optional)

**No minimum** — optional section.

---

## 5. Template System

### TemplateId Union (`client/src/components/templates/types.ts`)

```typescript
export type TemplateId =
  | 'modern'
  | 'modern_yellow_split'
  | 'dark_ribbon_modern'
  | 'modern_minimalist_block'
  | 'editorial_earth_tone'
  | 'ats_clean'
  | 'ats_lined';

export interface ResumeTemplateProps {
  data: ResumeFormData;
  isPreview?: boolean;
}
```

### Template Registry

| TemplateId | Layout | Colors | Photo | Category | Sort |
|------------|--------|--------|-------|----------|------|
| `modern` | Single-col, centered header | White bg, clean | yes | modern | 0 |
| `modern_yellow_split` | 2-col yellow split | Yellow accent | yes | modern | 1 |
| `dark_ribbon_modern` | 2-col dark sidebar | Charcoal `#2b2b2b`, ribbon headers | yes | modern | 9 |
| `modern_minimalist_block` | 2-col dark sidebar | Charcoal `#454545`, dark block headers | yes | modern | 10 |
| `editorial_earth_tone` | 2-col, vertical pill sidebar | Earth `#483930`, beige `#EFEBE3` | yes | modern | 11 |
| `ats_clean` | Single-col, no sidebar | White `#ffffff`, text `#222222` | no | ats | 12 |
| `ats_lined` | Single-col, no sidebar | Navy accent `#1a3557`, border-bottom h2 | no | ats | 13 |

**Category tabs on frontend:** All, Modern, ATS (no Creative or Professional tabs).

### Template Component Files (`client/src/components/templates/`)

| File | TemplateId |
|------|-----------|
| `ModernTemplate.tsx` | `modern` |
| `ModernYellowSplitTemplate.tsx` | `modern_yellow_split` |
| `DarkRibbonModernTemplate.tsx` | `dark_ribbon_modern` |
| `ModernMinimalistBlockTemplate.tsx` | `modern_minimalist_block` |
| `EditorialEarthToneTemplate.tsx` | `editorial_earth_tone` |
| `AtsCleanTemplate.tsx` | `ats_clean` |
| `AtsLinedTemplate.tsx` | `ats_lined` |
| `ResumeTemplateSwitcher.tsx` | maps templateId → component |

### Template Rendering Rules

- Templates use **inline styles only** — no Tailwind (Puppeteer has no CSS context)
- Templates use `width: '100%'` and `minHeight: '100%'` on outermost div (NOT `width: "8.5in"`)
- `ResumePreview.tsx` container sets `width: 816px` (8.5in × 96dpi) — template fills it
- PDF export uses `format: 'A4'`, zero margins — template owns all spacing

### Rendering Helper Utilities (`client/src/components/templates/helpers/renderingHelpers.ts`)

```typescript
formatHeading(text: string): string  // e.g., uppercase + spacing
parseResponsibilities(text: string): string[]  // split bullet points
```

---

## 6. Live Preview

**File:** `client/src/components/live-preview/ResumePreview.tsx`

**Props:**
```typescript
interface Props {
  data: ResumeFormData;
  templateId: string;
  onChooseTemplate?: () => void;
  zoom?: number;         // 0.5 to 1.5
  zoomPercent?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToWidth?: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}
```

**Behavior:**
- Container: `width: 816px`, scrollable, custom scrollbar
- Memoized to prevent re-renders on every keystroke — only updates on `debouncedFormData` change
- `ResumeTemplateSwitcher` maps `templateId` → template component
- `TemplateRenderer.tsx` is a shim that calls `ResumeTemplateSwitcher` (kept for backward compat)

---

## 7. Draft Management

### Save Draft (`POST /api/resume/draft/save`)

**Request body:**
```json
{
  "resumeId": "uuid-optional",
  "formData": { ...ResumeFormData }
}
```

**Controller logic:**
1. If `resumeId`: `UPDATE resumes SET target_role = $1, status = 'draft' WHERE id = $2 AND user_id = $3`
2. Else: `INSERT INTO resumes (user_id, target_role, status) RETURNING id` → get `finalResumeId`
3. `INSERT INTO resume_data (resume_id, form_data) ... ON CONFLICT (resume_id) DO UPDATE SET form_data = EXCLUDED.form_data`
4. Return `{ success: true, resumeId: finalResumeId }`

**Frontend trigger:** `handleSaveDraft()` called manually + auto-triggered via debounce in some implementations.

### Load Draft (`GET /api/resume/draft/:id`)

**Response:**
```json
{
  "resumeId": "uuid",
  "formData": { ...ResumeFormData },
  "updatedAt": "2026-03-24T10:00:00Z"
}
```

**On page load** (`/build/:id`): reads `id` URL param → fetches draft → restores `formData` + `selectedTemplate`.

---

## 8. API Endpoints (Resume Routes)

All routes under `/api/resume/`. All require `isAuthenticated`.

### Route Table

| Method | Path | Handler |
|--------|------|---------|
| `GET` | `/` | `listResumes` |
| `POST` | `/upload` | `uploadResume` (Path A, full analysis) |
| `POST` | `/upload-simple` | `uploadResumeSimple` (Path A, no analysis — for cover letter flow) |
| `POST` | `/build` | `buildResume` (Path B) |
| `POST` | `/draft/save` | `saveDraft` |
| `GET` | `/draft/:id` | `loadDraft` |
| `GET` | `/:id/file` | `getResumeFile` (proxy Cloudinary PDF for Path A) |
| `GET` | `/:id` | `getResume` |
| `DELETE` | `/:id` | `deleteResume` |
| `POST` | `/:id/switch-template` | `switchTemplate` |

### `POST /api/resume/build`

**Request body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "city": "string",
  "country": "string",
  "targetRole": "string",
  "targetIndustry": "string",
  "targetCountry": "string",
  "targetCity": "string (optional)",
  "linkedinUrl": "string (optional)",
  "portfolioUrl": "string (optional)",
  "additionalLinks": [],
  "profilePhoto": "base64 string (optional)",
  "education": [],
  "experience": [],
  "projects": [],
  "skills": {
    "technical": [{ "category": "Languages", "items": ["Python"] }],
    "soft": ["Communication"],
    "languages": [{ "language": "English", "proficiency": "native" }]
  },
  "professionalSummary": "string",
  "certifications": "string (optional)",
  "extracurriculars": "string (optional)",
  "templateId": "modern",
  "resumeId": "uuid (optional — update existing)"
}
```

**Controller logic:**
1. `transformFormData()` — flatten nested `skills` to `technicalSkills` string + `softSkills` array
2. If `resumeId`: `UPDATE resumes SET target_role, target_country, target_city, template_id, updated_at WHERE id = $1 AND user_id = $2`
3. Else: `INSERT INTO resumes (user_id, target_role, target_country, target_city, template_id, status) RETURNING id`
4. Upsert `resume_data`: `INSERT INTO resume_data (resume_id, form_data) VALUES ($1, $2) ON CONFLICT (resume_id) DO UPDATE SET form_data = EXCLUDED.form_data`
5. Return `{ resume }`

### `GET /api/resume/:id`

**SQL:**
```sql
SELECT r.*, rd.form_data
FROM resumes r
LEFT JOIN resume_data rd ON r.id = rd.resume_id
WHERE r.id = $1 AND r.user_id = $2
```

Returns full resume with `form_data` field attached.

### `DELETE /api/resume/:id`

1. Verify ownership
2. `DELETE FROM resume_data WHERE resume_id = $1`
3. `DELETE FROM resumes WHERE id = $1 AND user_id = $2`
4. Delete from Cloudinary if `file_path` exists (non-fatal error)

### `GET /api/resume/:id/file`

For Path A resumes only. Proxies the Cloudinary PDF:
```typescript
https.get(filePath, (stream) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');
  stream.pipe(res);
});
```

### `POST /api/resume/upload-simple`

Lightweight upload for cover letter flow (no text extraction at upload time):
1. Upload PDF buffer to Cloudinary → `secure_url`
2. `INSERT INTO resumes (user_id, file_path) RETURNING *`
3. Text extracted lazily on first `/extract-keywords` call

---

## 9. PDF Export

### `exportPdfWithTemplate()` — `client/src/utils/api.ts`

```typescript
export async function exportPdfWithTemplate(templateId: string, formData: ResumeFormData): Promise<void>
```

**Flow:**
1. Create a hidden `div`, mount React template component via `createRoot` + `flushSync`
2. Extract `innerHTML` → wrap in full HTML document with `<meta charset>` + `<style>` reset
3. `POST /api/export/pdf-from-html` with `{ html }` body (up to 10MB)
4. Server returns PDF blob → trigger browser download

**Constraints:**
- 60s timeout (Puppeteer can be slow)
- `express.json({ limit: '10mb' })` required for base64 photos
- Templates must use inline styles only (no Tailwind classes in Puppeteer)

### Backend PDF Generation — `server/src/services/export/pdfGenerator.ts`

```typescript
export async function generatePdf(html: string, opts?: { margins?: boolean }): Promise<Buffer>
```

- Puppeteer: `format: 'A4'`
- `opts.margins === false` → zero page margins (template owns all spacing)
- Returns Buffer → sent as `Content-Type: application/pdf`

### Route

```
POST /api/export/pdf-from-html
Body: { html: string }
Returns: PDF binary
```

---

## 10. AI Services

### `POST /api/ai/generate-skills`

Generates technical + soft skill suggestions based on role and industry.

**Model:** gpt-4o-mini, temperature 0.5

**Returns:** `{ technical: TechnicalSkillCategory[], soft: string[] }`

### `POST /api/ai/generate-summary`

Generates a professional summary (100–300 words) from the form data.

**Model:** gpt-4o-mini, temperature 0.7

**Returns:** `{ summary: string }`

### `resumeGenerator.ts` — `generateResume()`

Used internally by `buildResume` or as standalone AI generation.

**Model:** gpt-4o-mini, temperature 0.3

**System prompt:**
```
You are an expert resume writer specializing in ATS-optimized resumes for fresh graduates.
Generate a professional resume and provide analysis. Respond with ONLY valid JSON in this exact format:
{
  "resumeText": "<full resume text with proper sections>",
  "matchPercentage": <number 0-100>,
  "aiAnalysis": {
    "strengths": ["strength1", ...],
    "weaknesses": ["weakness1", ...],
    "suggestions": ["suggestion1", ...]
  }
}
```

**User prompt:**
```
Generate an ATS-optimized resume for a "{targetRole}" position in {targetCity}, {targetCountry}.

Candidate Information:
{formatted form data}

Requirements:
1. Generate a complete, professionally formatted resume text with clear sections...
2. Use strong action verbs and quantify achievements where possible
3. Optimize keywords for ATS compatibility for the target role
4. Provide a match percentage (0-100) for how well this candidate fits the target role
5. List strengths, weaknesses, and improvement suggestions
```

---

## 11. Database Schema

### Migration 003: `resumes` table

```sql
CREATE TABLE resumes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_path                VARCHAR(500),        -- Cloudinary URL (Path A)
  parsed_text              TEXT,                -- Extracted PDF text
  target_role              VARCHAR(255),
  target_country           VARCHAR(100),
  target_city              VARCHAR(100),
  match_percentage         INTEGER,
  ai_analysis              JSONB,               -- { strengths[], weaknesses[], suggestions[] }
  ats_score                INTEGER,
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
```

### Migration 004: `resume_data` table

```sql
CREATE TABLE resume_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id   UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  form_data   JSONB NOT NULL,    -- Full ResumeFormData JSON
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resume_id)              -- one form_data per resume
);
CREATE INDEX idx_resume_data_resume_id ON resume_data(resume_id);
```

### Migration 005: Live Preview columns

```sql
ALTER TABLE resumes ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE resumes ADD COLUMN template_id VARCHAR(50) DEFAULT 'modern';
ALTER TABLE resumes ADD COLUMN created_with_live_preview BOOLEAN DEFAULT FALSE;
```

### Migration 018: Job Description

```sql
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS job_description TEXT DEFAULT NULL;
```

### Current `resumes` table columns

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK users |
| `file_path` | VARCHAR(500) | Cloudinary URL, null for Path B |
| `parsed_text` | TEXT | Extracted text, null for fresh Path B |
| `target_role` | VARCHAR(255) | |
| `target_country` | VARCHAR(100) | |
| `target_city` | VARCHAR(100) | |
| `match_percentage` | INTEGER | From AI analysis |
| `ai_analysis` | JSONB | `{ strengths, weaknesses, suggestions }` |
| `ats_score` | INTEGER | |
| `job_description` | TEXT | Optional JD for analysis |
| `template_id` | VARCHAR(50) | Active template slug |
| `status` | VARCHAR(20) | `'draft'` or `'complete'` |
| `created_with_live_preview` | BOOLEAN | |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## 12. TypeScript Interfaces

### `ResumeFormData` (`client/src/types/index.ts`)

```typescript
interface ResumeFormData {
  // Personal Info (Step 0)
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[];  // up to 3
  profilePhoto?: string;               // base64
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
  targetIndustry: string;              // dropdown: 13 options

  // Education (Step 1)
  education: Education[];

  // Experience (Step 2)
  experience: Experience[];

  // Skills (Step 3)
  skills: {
    technical: TechnicalSkillCategory[];
    soft: string[];
    languages: LanguageSkill[];
  };

  // Summary (Step 4)
  professionalSummary: string;

  // Additional/Projects (Step 5)
  projects: Project[];
  certifications?: string;
  extracurriculars?: string;
}

interface Education {
  degreeType: string;
  major: string;
  university: string;
  graduationDate: string;   // format: "YYYY-MM"
  gpa?: string;
  relevantCoursework: string;
  honors?: string;
}

interface Experience {
  type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
  company: string;
  role: string;
  duration: string;          // e.g., "Jun 2023 – Aug 2023"
  responsibilities: string;
  industry?: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
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

### Backend Skills Transformation

Frontend sends nested structure; backend flattens for AI:

```typescript
// Frontend input:
{ skills: { technical: [{ category: "Languages", items: ["Python"] }], soft: ["Communication"], languages: [{ language: "English", proficiency: "native" }] } }

// After transformFormData():
{ technicalSkills: "Languages: Python", softSkills: ["Communication"], languages: [{ name: "English", proficiency: "native" }] }
```

### `Resume` / `ResumeSummary` types

```typescript
interface Resume {
  id: string;
  user_id: string;
  file_path: string | null;
  parsed_text: string | null;
  target_role: string | null;
  target_country: string | null;
  target_city: string | null;
  match_percentage: number | null;
  ai_analysis: { strengths: string[]; weaknesses: string[]; suggestions: string[] } | null;
  ats_score: number | null;
  job_description: string | null;
  template_id: string | null;
  status: string;
  created_with_live_preview: boolean;
  created_at: string;
  updated_at: string;
  form_data?: ResumeFormData;   // joined from resume_data
}

interface ResumeSummary {
  id: string;
  target_role: string | null;
  target_country: string | null;
  target_city: string | null;
  match_percentage: number | null;
  ats_score: number | null;
  created_at: string;
  file_path: string | null;    // null = Path B (builder)
  template_id: string | null;
}
```

---

## 13. Error Handling & Security

### Backend pattern
```typescript
(req, res, next) => { try { ... } catch(err) { next(err) } }
```

### Validation
- `buildResumeValidators`: `body('targetRole').exists().isString()...` etc.
- Validation middleware: `validate` — returns `400` with `{ errors: [...] }`

### Prompt Injection (`server/src/utils/sanitizePromptInput.ts`)

AI inputs (targetRole, skills content, etc.) are sanitized before prompt injection:
- Strips null bytes and control chars
- Replaces injection phrases with `[redacted]`
- Truncates to 8000 chars

### File Upload Security
- Multer PDF filter: rejects non-`application/pdf` MIME types
- Max file size enforced via multer `limits.fileSize`
- Files streamed to Cloudinary — not stored on disk in production

---

## 14. Testing

### Backend (`server/src/controllers/__tests__/resumeController.test.ts`)

**Required mocks:**
```typescript
jest.mock('../../config/db')
jest.mock('../../services/ai/resumeGenerator')
jest.mock('../../config/cloudinary')
```

**Windows note:** `beforeEach` cleanup wraps `fs.unlinkSync` in try-catch to ignore `EBUSY` (file locking on test uploads).

### Frontend (`client/src/pages/__tests__/ResumeBuilderPage.test.tsx`)

**Required:**
```typescript
vi.clearAllTimers() // in beforeEach
// Timeout: 15000ms on navigation tests (live preview is slow in tests on Windows)
// Pool: --pool=threads flag on Windows (avoids forks timeout)
```

---

## 15. Key File Index

| File | Purpose |
|------|---------|
| `client/src/pages/ResumeBuilderPage.tsx` | Main page — all state, steps, export |
| `client/src/components/resume-builder/steps/PersonalInfoStep.tsx` | Step 0 form |
| `client/src/components/resume-builder/steps/EducationStep.tsx` | Step 1 form |
| `client/src/components/resume-builder/steps/ExperienceStep.tsx` | Step 2 form |
| `client/src/components/resume-builder/steps/SkillsStep.tsx` | Step 3 form (AI suggestions) |
| `client/src/components/resume-builder/steps/SummaryStep.tsx` | Step 4 form (AI generation) |
| `client/src/components/resume-builder/steps/AdditionalStep.tsx` | Step 5 form (projects) |
| `client/src/components/live-preview/ResumePreview.tsx` | Live preview wrapper |
| `client/src/components/templates/ResumeTemplateSwitcher.tsx` | templateId → component map |
| `client/src/components/templates/types.ts` | TemplateId union + ResumeTemplateProps |
| `client/src/components/templates/helpers/renderingHelpers.ts` | formatHeading, parseResponsibilities |
| `client/src/components/live-preview/templateTypes.ts` | TemplateBasicInfo registry |
| `client/src/utils/api.ts` | buildResume, getResume, exportPdfWithTemplate, etc. |
| `client/src/types/index.ts` | ResumeFormData, Education, Experience, TemplateId |
| `client/src/hooks/useTemplates.ts` | Fetch templates list |
| `client/src/hooks/useTemplateSwitch.ts` | Switch template for saved resume |
| `server/src/controllers/resumeController.ts` | All resume handlers |
| `server/src/routes/resume/index.ts` | Route definitions + validators |
| `server/src/services/ai/resumeGenerator.ts` | GPT-4o-mini resume generation |
| `server/src/services/export/pdfGenerator.ts` | Puppeteer PDF from HTML |
| `server/src/config/cloudinary.ts` | Cloudinary SDK config |
| `server/src/migrations/003_create_resumes.ts` | resumes table |
| `server/src/migrations/004_create_resume_data.ts` | resume_data table |
| `server/src/migrations/005_add_live_preview_columns.ts` | status, template_id, created_with_live_preview |
| `server/src/migrations/018_add_job_description.ts` | job_description column |

---

## 16. Production Checklist

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

# Cloudinary (required for Path A uploads and uploadResumeSimple)
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

# 2. Run database migrations (idempotent)
cd server && npm run migrate

# 3. Build frontend
cd client && npm run build   # → client/dist/

# 4. Build backend
cd server && npm run build   # → server/dist/

# 5. Start
NODE_ENV=production node server/dist/app.js
```

### Health Check
`GET /api/health` — returns `{ status: 'healthy' | 'degraded', checks: { db } }`.

### Security Checklist
- [ ] `SESSION_SECRET` is cryptographically random (≥32 bytes)
- [ ] `CLIENT_URL` locked to production domain — no wildcards
- [ ] Set OpenAI billing limits in OpenAI dashboard (aiLimiter is 10/15min but doesn't protect against billing abuse if your key leaks)
- [ ] Cloudinary upload preset scoped if possible (not full account access)
- [ ] `express.json({ limit: '10mb' })` — needed for base64 photos in PDF export
- [ ] Multer PDF filter active — rejects non-PDF uploads
- [ ] All resume routes require `isAuthenticated` ✓
- [ ] Ownership check in every DB query (WHERE user_id = $N) ✓

### Puppeteer in Production
- Puppeteer requires Chromium. On most Linux servers you need:
  ```bash
  apt-get install -y chromium-browser
  # or: npx puppeteer browsers install chrome
  ```
- Set `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` and `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser` if using system Chromium
- Or use `puppeteer-core` with a bundled browser path
- PDF export will fail silently if Chromium is not found — test on the deployment server before go-live

### Common Go-Live Issues

| Symptom | Likely Cause |
|---------|-------------|
| CORS errors in browser | `CLIENT_URL` doesn't match deployed frontend origin exactly |
| Sessions not persisting | `SESSION_SECRET` changed between deploys, or missing `secure: true` + HTTPS |
| Email verification not sending | `RESEND_API_KEY` not set; domain not verified in Resend |
| PDF upload fails | `CLOUDINARY_*` vars missing or incorrect |
| PDF export fails | Puppeteer/Chromium not installed on server |
| AI calls fail | `OPENAI_API_KEY` invalid or quota exceeded |
| `npm run migrate` fails | `DATABASE_URL` incorrect or DB not reachable |
| 404 on SPA page refresh | `NODE_ENV=production` not set — Express won't serve `client/dist` |
| Build resume 413 error | `express.json` limit too low (needs `10mb` for photos) |
| Blank PDF output | Template using Tailwind classes instead of inline styles |
