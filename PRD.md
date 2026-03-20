# Product Requirements Document (PRD)
# AI-Powered Resume & Cover Letter Builder for Fresh Graduates

**Version:** 2.0  
**Date:** March 18, 2026  
**Target Audience:** Fresh graduates seeking junior-level positions

---

## 1. Product Overview

### 1.1 Core Value Proposition

An AI-powered SaaS platform that enables fresh graduates to create ATS-optimized resumes and cover letters through intelligent automation. The system provides three core capabilities:

- Building professional resumes from scratch
- Generating tailored cover letters
- Delivering AI-powered analysis with job market insights

### 1.2 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL with JSONB storage |
| Authentication | Passport.js (session-based) |
| AI Engine | OpenAI GPT-4o-mini |
| PDF Generation | Puppeteer |
| Email Service | Resend |

---

## 2. Feature 1: Resume Building System

### 2.1 Business Logic Overview

The Resume Building feature allows users to construct professional resumes through a guided 6-step form with real-time preview and AI assistance. The system supports two paths: uploading existing PDFs (**Path A**) or building from scratch (**Path B**). This PRD focuses on Path B as the primary user journey.

### 2.2 Core Workflow

#### 2.2.1 User Journey

```
User Authentication (Email Verified)
↓
Navigate to /build
↓
6-Step Form Completion (Progressive Validation)
↓
AI Skills & Summary Generation (On-Demand)
↓
Template Selection (7 Options)
↓
Live Preview (300ms Debounced)
↓
Submit for AI Analysis
↓
Resume Created with Match Percentage
↓
Export (PDF/Markdown)
```

#### 2.2.2 Multi-Step Form Architecture

**Step Navigation Rules:**
- Steps rendered simultaneously (CSS show/hide to prevent data loss)
- Steps 0, 1, 4 are required (blocking)
- Steps 2, 3, 5 are optional (always pass validation)
- Completed steps remain clickable for navigation
- Progress indicator shows completion status

**Step Breakdown:**

| Step | Section | Required Fields | Validation Rules |
|---|---|---|---|
| 0 | Personal Info | fullName, email, phone, city, country, targetRole, targetIndustry, targetCountry | 8 fields mandatory; profile photo conditional on template support |
| 1 | Education | At least 1 education entry | degreeType, major, university, graduationDate all required per entry |
| 2 | Experience | None (optional) | Rich text editor for responsibilities with markdown support |
| 3 | Skills | None (optional) | AI auto-generation triggered on entry; 15 max suggestions |
| 4 | Summary | professionalSummary (100-500 chars) | Character count validation; AI generation available |
| 5 | Additional | None (optional) | Projects, certifications, extracurricular activities |

### 2.3 Data Models

#### 2.3.1 Frontend Data Structure (ResumeFormData)

```typescript
interface ResumeFormData {
  // Step 0: Personal Information
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[]; // Max 3
  profilePhoto?: string; // Base64 DataURL
  targetRole: string;
  targetIndustry: string; // 13 options
  targetCountry: string;
  targetCity?: string;

  // Step 1: Education
  education: Education[]; // Min 1 required

  // Step 2: Experience
  experience: Experience[]; // Optional

  // Step 3: Skills (Nested Structure)
  skills: {
    technical: TechnicalSkillCategory[]; // [{category, items[]}]
    soft: string[];
    languages: LanguageSkill[]; // [{language, proficiency}]
  };

  // Step 4: Summary
  professionalSummary: string; // 100-500 chars

  // Step 5: Additional
  projects: Project[];
  certifications?: string;
  extracurriculars?: string;
}
```

#### 2.3.2 Backend Data Transformation

The backend transforms the nested frontend structure into a flat format for AI processing:

**Input (Frontend):**
```json
{
  "skills": {
    "technical": [
      {"category": "Languages", "items": ["Python", "JavaScript"]},
      {"category": "Frameworks", "items": ["React", "Express"]}
    ],
    "soft": ["Communication", "Teamwork"],
    "languages": [{"language": "English", "proficiency": "fluent"}]
  }
}
```

**Output (Backend for AI):**
```json
{
  "technicalSkills": {
    "Languages": ["Python", "JavaScript"],
    "Frameworks": ["React", "Express"]
  },
  "softSkills": ["Communication", "Teamwork"],
  "languages": [{"name": "English", "proficiency": "fluent"}]
}
```

#### 2.3.3 Database Schema

```sql
-- resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filepath VARCHAR(500),           -- NULL for Path B
  parsedtext TEXT,                 -- AI-generated resume text
  targetrole VARCHAR(255),
  targetcountry VARCHAR(100),
  targetcity VARCHAR(100),
  jobdescription TEXT,
  matchpercentage INTEGER,
  aianalysis JSONB,                -- {strengths[], weaknesses[], suggestions[]}
  atsscore INTEGER,
  templateid VARCHAR(50) DEFAULT 'modern',
  status VARCHAR(20) DEFAULT 'draft',
  createdwithlivepreview BOOLEAN DEFAULT FALSE,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- resumedata table
CREATE TABLE resumedata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumeid UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  formdata JSONB NOT NULL,         -- Raw frontend ResumeFormData
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resumedata_resumeid ON resumedata(resumeid);
```

> **Key Design Decision:** The `resumedata.formdata` column stores the raw frontend format (nested skills structure), not the transformed backend format. This enables the frontend to reconstruct the exact form state when loading drafts.

### 2.4 AI-Powered Features

#### 2.4.1 Skills Auto-Generation

**Trigger Conditions:**
- User enters Step 3 (Skills)
- `targetRole` or `targetIndustry` has changed since last generation
- `!skillsGenerated` flag is false

**Business Logic:**
```
Frontend Detection → POST /api/ai/generate-skills
↓
Backend checks aicache table (key: "skills:v2:{role}:{industry}")
↓
Cache Hit → Return cached JSON (30-day TTL)
↓
Cache Miss → Call GPT-4o-mini
↓
GPT Response:
{
  technical: [{category, items[]}], // 2-3 categories, 4-5 items each
  soft: string[],                   // 2-3 suggestions (excludes hardcoded UI list)
  languages: [{language, proficiency}]
}
↓
UPSERT aicache → Return to frontend
↓
Frontend flattens to max 15 suggestions → Display as clickable pills
```

**AI Prompt Configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.3` (deterministic)
- Response Format: JSON mode
- Exclusion List: 10 hardcoded soft skills (Communication, Teamwork, etc.)

**Caching Strategy:**
- Cache Key: `skills:v2:{targetRole.toLowerCase()}:{targetIndustry.toLowerCase()}`
- TTL: 30 days
- Benefit: First user pays GPT cost, subsequent users get instant results

#### 2.4.2 Professional Summary Generation

**Trigger:** User clicks "Generate with AI" button in Step 4

**Business Logic:**
```
Frontend → POST /api/ai/generate-summary
↓
Payload:
{
  targetRole, targetIndustry, targetCountry,
  education: [top 1 entry],
  experience: [company names only],
  projects: [top 3],
  skills: {technical: [top 10]}
}
↓
Backend condenses context → GPT-4o-mini prompt
↓
GPT generates 2-3 sentence summary (100-150 words)
↓
Return summary string → Frontend validation (100-500 chars)
↓
Display in textarea with character counter
```

**AI Prompt Configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.4` (slightly creative)
- Max Tokens: 300
- Context: Condensed to avoid token waste
- Confirmation Dialog: If summary already exists, prompt user before overwriting.

#### 2.4.3 Full Resume Generation & Analysis

**Trigger:** User clicks "Submit" on Step 5 (final step)

**Business Logic:**
```
Frontend Validation:
  ✓ Step 0: 8 required fields
  ✓ Step 1: ≥1 education entry with 4 required fields
  ✓ Step 4: professionalSummary length 100-500
↓
POST /api/resume/build
↓
Backend: buildResume Controller
↓
1. transformFormData() → Flatten skills structure
2. generateResume(transformedData) → GPT-4o-mini call
↓
GPT Output:
{
  resumeText: string,             // Formatted resume with sections
  matchPercentage: number (0-100),
  aiAnalysis: {
    strengths: string[],
    weaknesses: string[],
    suggestions: string[]
  }
}
↓
3. INSERT INTO resumes (parsedtext, matchpercentage, aianalysis, templateid)
4. INSERT INTO resumedata (formdata) -- Raw frontend JSON
5. Return resume object
↓
Frontend: Navigate to /resume/{id} with match percentage displayed
```

**AI Prompt Configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.3` (professional tone)
- Response Format: JSON mode
- System Prompt: "Expert resume writer, respond with JSON"
- User Prompt: Build complete resume with Contact/Summary/Education/Experience/Projects/Skills sections using strong action verbs and ATS keywords

**Match Percentage Logic:**
- Based on alignment between user's background and `targetRole` + `targetCountry`
- Considers experience level appropriateness for junior roles
- Output: 0-100 integer with 3-5 strengths/weaknesses/suggestions

### 2.5 Template System

#### 2.5.1 Template Selection

**Available Templates (7 Total):**

| Template ID | Category | Layout | Photo Support | ATS-Friendly |
|---|---|---|---|---|
| modern | Modern | Single-column centered, Inter font | Yes | Partial |
| modernyellowsplit | Modern | 2-column yellow split | Yes | Partial |
| darkribbonmodern | Modern | 2-column dark sidebar | Yes | Partial |
| modernminimalistblock | Modern | 2-column dark block headers | Yes | Partial |
| editorialearthtone | Modern | 2-column vertical pill sidebar | Yes | Partial |
| atsclean | ATS | Single-column, white bg | No | Yes |
| atslined | ATS | Single-column, navy accents | No | Yes |

**Template Persistence:**
- Stored in `localStorage` with key: `resumeBuilderselectedTemplate`
- Default: `modern` (if not found or invalid)
- Per-resume: Stored in `resumes.templateid` column

**Photo Support Logic:**
```typescript
const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern: true,
  modernyellowsplit: true,
  darkribbonmodern: true,
  modernminimalistblock: true,
  editorialearthtone: true
  // atsclean and atslined NOT in map → false
};
// Photo upload UI shown in Step 0 only when SUPPORTS_PHOTO[selectedTemplate] === true
```

#### 2.5.2 Live Preview System

**Architecture:**
```
ResumeBuilderPage.tsx
↓
formData state → useDebounce(formData, 300ms) → debouncedFormData
↓ (wrapped in React.memo)
ResumeTemplateSwitcher → Maps templateId to React component
↓
Render template with inline styles (Puppeteer-compatible)
```

**Desktop Layout (≥1024px):**
- Two-column flex layout
- Left: Form (fixed width, scrollable)
- Right: Preview (full viewport height, sticky, scales to fit)

**Mobile Layout (<1024px):**
- Stacked layout with tab switcher: "Edit" | "Preview"

**Debouncing Rationale:**
- Prevents excessive re-renders during typing
- 300ms delay balances responsiveness with performance
- Raw `formData` updates immediately for form inputs

### 2.6 Draft Management

#### 2.6.1 Save Draft

**Trigger:** User clicks "Save Draft" button

**Business Logic:**
```
POST /api/resume/draft/save
↓
Payload: {formData, resumeId?}
↓
Backend:
  IF no resumeId:
    INSERT INTO resumes (status='draft')
    INSERT INTO resumedata (formdata)
    RETURN new resumeId
  ELSE:
    Verify ownership (resumes.userid = req.user.id)
    UPDATE resumes SET targetrole, targetcountry, targetcity
    UPSERT resumedata SET formdata (ON CONFLICT resumeid)
    RETURN existing resumeId
↓
Frontend:
  Store resumeId in state
  Show "Saved" indicator for 2s
  URL remains at /build (no redirect)
```

**Unsaved Changes Warning:**
- `hasUnsavedChanges` flag tracks form edits
- Browser `beforeunload` event listener triggers confirmation dialog
- Prevents accidental data loss on tab close or navigation

#### 2.6.2 Load Draft

**Trigger:** User navigates to `/build?id={resumeId}`

**Business Logic:**
```
GET /api/resume/draft/{id}
↓
Backend:
  SELECT resumes.id, updatedat
  LEFT JOIN resumedata ON resumeid
  WHERE resumes.id = {id} AND resumes.userid = {userId}
↓
RETURN {resumeId, formData, updatedAt}
↓
Frontend:
  setFormData(draft.formData)
  setResumeId(draft.resumeId)
  Auto-mark steps as completed:
    IF formData.fullName → completedSteps.add(0)
    IF formData.education?.length → completedSteps.add(1)
    etc.
```

### 2.7 Export System

#### 2.7.1 Template-Aware PDF Export (Primary)

```
Client-Side:
1. Render <ResumeTemplateSwitcher> to hidden DOM div
2. Use flushSync + createRoot for synchronous render
3. Extract innerHTML as HTML string (inline styles preserved)
4. POST /api/export/pdf-from-html {html}
↓
Server-Side:
1. generatePdf(html, {margins: false})
2. Puppeteer launch → setContent(html)
3. page.pdf({format: 'A4', printBackground: true, margin: 0})
4. Return PDF buffer
↓
Client: Browser download via Blob
```

> **Why Client-Side Rendering?** Templates are React components with inline styles. Server has Puppeteer but no React runtime. Solution: Render on client → Send HTML → Puppeteer prints.

#### 2.7.2 Markdown Export

- **Endpoint:** `GET /api/export/markdown/{resumeId}`
- **Process:** Fetch `resumedata.formdata` from database → Convert to plain Markdown format → Return as `.md` file download

### 2.8 Validation & Error Handling

#### 2.8.1 Validation Flow

```
Request arrives at POST /api/resume/build
↓
isAuthenticated middleware → 401 if not logged in
↓
buildResumeValidators (express-validator rules)
↓
validate middleware → 400 with errors[] if any fail
↓
buildResume controller (only reached if all pass)
```

**Backend Validation Rules:**
- `fullName`: required, non-empty string
- `email`: required, valid email format
- `phone`: required, non-empty string
- `targetRole`: required, non-empty string
- `targetCountry`: required, non-empty string
- `education`: required array, min 1 item
- `professionalSummary`: required, non-empty string

#### 2.8.2 Security Measures

**Prompt Injection Defense:**
All user-supplied text passed to GPT sanitized via `sanitizePromptInput()`:
- Strips null bytes, control characters
- Replaces injection phrases: `"ignore all previous instructions"`, `"you are now"`, etc.
- Truncates to 8000 chars max

**Rate Limiting:**
- AI routes: 10 requests per 15 minutes per IP (`aiLimiter`)
- Applied to: `/api/ai/generate-skills`, `/api/ai/generate-summary`, `/api/resume/build`

**File Size Limits:**
- Profile photo: 2MB client-side validation before Base64 encoding
- JSON body: 10MB (for Base64 photos + HTML payloads in PDF export)

---

## 3. Feature 2: Cover Letter Generation

### 3.1 Business Logic Overview

The Cover Letter Generator creates ATS-optimized cover letters through a two-step AI process:
1. Keyword extraction between resume and job description
2. Letter writing with missing keywords naturally woven in

Users can edit inline, revert to AI original, and export as PDF or TXT.

### 3.2 Core Workflow

```
User selects resume from dropdown
↓
Pastes job description (max 5000 chars)
↓
Fills company name, optional fields (tone, length, hiring manager)
↓
Clicks "Generate Cover Letter"
↓
Step 1: Extract Keywords (POST /api/cover-letter/extract-keywords)
  → Returns matched/missing keywords
  → Display as green/red badges (1.2s pause for preview)
↓
Step 2: Generate Letter (POST /api/cover-letter/generate)
  → AI writes letter with keywords embedded
  → Upsert into coverletters table
↓
Letter displayed in editable textarea
↓
User edits → Click "Save Changes" (PUT /api/cover-letter/{id})
↓
Export as PDF or TXT
```

### 3.3 Entry Points

| Mode | URL | Behavior |
|---|---|---|
| Standalone | `/cover-letter/new` | Resume selector dropdown; user picks which resume to base letter on |
| Attached | `/cover-letter/new?resumeId={uuid}` | Resume pre-selected; form pre-fills from resume data |

### 3.4 Data Models

#### 3.4.1 Cover Letter Types

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';
// Word targets: short=150, medium=250, long=400

export interface CoverLetter {
  id: string;                          // UUID
  resumeid: string | null;             // Nullable for standalone letters
  userid: string;
  jobtitle: string | null;
  content: string;                     // Mutable (user edits this)
  generatedcontent: string;            // Immutable (AI original for revert)
  tone: CoverLetterTone;
  wordcounttarget: CoverLetterLength;
  companyname: string | null;
  hiringmanagername: string | null;
  custominstructions: string | null;
  createdat: string;
  updatedat: string;
}
```

#### 3.4.2 Database Schema

```sql
CREATE TABLE coverletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumeid UUID REFERENCES resumes(id) ON DELETE CASCADE, -- Nullable
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jobtitle VARCHAR(255),
  content TEXT NOT NULL,               -- Mutable
  generatedcontent TEXT NOT NULL,      -- Immutable
  tone VARCHAR(50) DEFAULT 'professional',
  wordcounttarget VARCHAR(20) DEFAULT 'medium',
  companyname VARCHAR(255),
  hiringmanagername VARCHAR(255),
  custominstructions TEXT,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coverletters_resume_created ON coverletters(resumeid, createdat DESC);
```

**Key Design Decisions:**
- `resumeid` is nullable → Supports standalone letters not attached to any resume
- No UNIQUE constraint on `resumeid` → Multiple cover letters allowed per resume
- `content` vs `generatedcontent` → `content` is editable, `generatedcontent` frozen for "Revert to AI Original"
- `ON DELETE CASCADE` → Deleting a resume auto-deletes associated cover letters

### 3.5 Two-Step AI Process

#### 3.5.1 Step 1: Keyword Extraction

**Endpoint:** `POST /api/cover-letter/extract-keywords`

**Request Payload:**
```json
{
  "resumeId": "uuid-v4",
  "jobDescription": "string (max 5000 chars)"
}
```

**Backend Logic:**
1. Query `resumes LEFT JOIN resumedata WHERE resumeid AND userid`
2. Build `resumeText`:
   - IF `parsedtext` (Path A): Use `parsedtext`
   - ELSE: `buildResumeTextFromFormData(formdata)` (Path B)
3. Call `extractKeywords(resumeText, jobDescription)`
   - GPT-4o-mini (temp=0.3, JSON mode)
   - System Prompt: "Identify keywords present in resume vs. JD"
   - Input: `resumeText` (truncated 3000 chars), `jobDescription` (truncated 2000 chars)
   - Output: `{matchedKeywords: string[], missingKeywords: string[]}` — Max 10 each
4. Return `{matchedKeywords, missingKeywords}`

**AI Configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.3` (deterministic)
- Response Format: `type: "json_object"`
- Input Sanitization: `sanitizePromptInput()` before truncation

**Frontend Display:**
- Green badges for matched keywords
- Red badges for missing keywords
- 1.2s pause after extraction to let user preview before letter generation

#### 3.5.2 Step 2: Cover Letter Generation

**Endpoint:** `POST /api/cover-letter/generate`

**Request Payload:**
```json
{
  "resumeId": "uuid-v4",
  "fullName": "Jane Doe",
  "targetRole": "Software Engineer",
  "targetLocation": "London, UK",
  "jobDescription": "string (max 5000 chars)",
  "companyName": "Acme Corp",
  "hiringManagerName": "John Smith",
  "tone": "professional",
  "wordCountTarget": "medium",
  "matchedKeywords": ["React", "TypeScript"],
  "missingKeywords": ["Docker", "CI/CD"],
  "customInstructions": "Mention I'm open to relocation"
}
```

**Backend Logic:**
1. Query resume + formdata (same ownership check as Step 1)
2. Build `resumeText` via `getResumeText()` helper
3. Call `generateCoverLetter(params)` with GPT-4o-mini (temp=0.8, plain text)
4. UPSERT `coverletters`:
   ```sql
   INSERT ... ON CONFLICT (resumeid) DO UPDATE
   SET content = AI_output, generatedcontent = AI_output, ...
   ```
5. Return `coverLetter` object

**Word Count Mapping:**
```typescript
const WORD_COUNT_MAP = {
  short: 150,
  medium: 250,
  long: 400
};
```

**Tone Descriptions:**
- `professional`: Confident, polished, industry-standard language
- `enthusiastic`: Energetic and passionate while remaining professional
- `formal`: Conservative, no contractions, suitable for finance/law/government
- `conversational`: Warm and approachable, contractions OK, suitable for startups

**AI Configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.8` (creative text)
- Response Format: Plain text (no JSON)
- Input Sanitization: `jobDescription` → `sanitizePromptInput()` then slice to 2000 chars; `customInstructions` → `sanitizePromptInput()` (capped at 500 chars)

### 3.6 Inline Editing & Revert

#### 3.6.1 Save User Edits

**Endpoint:** `PUT /api/cover-letter/{id}`

**Request Payload:**
```json
{
  "content": "string (max 10000 chars)"
}
```

**Backend Logic:**
```sql
UPDATE coverletters cl
SET content = $1, updatedat = NOW()
FROM resumes r
WHERE cl.resumeid = r.id
  AND cl.resumeid = $2
  AND r.userid = $3
RETURNING cl.*;
```

> **Key Rule:** Only `content` column updated; `generatedcontent` never touched.

#### 3.6.2 Revert to AI Original

**Trigger:** User clicks "Revert to AI Original" link (shown when `editableContent !== coverLetter.generatedcontent`)

**Frontend Logic:**
```typescript
setEditableContent(coverLetter.generatedcontent);
// No API call; pure local state reset
```

### 3.7 Frontend Architecture

#### 3.7.1 State Machine (useCoverLetter hook)

```typescript
type ProgressStep =
  'idle' | 'extracting' | 'keywords-ready' | 'generating' | 'done' | 'error';

interface UseCoverLetterReturn {
  coverLetter: CoverLetter | null;
  keywords: {matched: string[], missing: string[]};
  progressStep: ProgressStep;
  isLoading: boolean;     // Initial fetch
  isSaving: boolean;      // Save in progress
  savedIndicator: boolean; // True for 2s after save
  error: string | null;
  generate: (payload) => Promise<void>;
  save: (content: string) => Promise<void>;
  reset: () => void;
}
```

**State Flow:**
```
idle → extracting (POST extract-keywords)
↓
keywords-ready (1.2s pause for badge preview)
↓
generating (POST generate)
↓
done (letter displayed)
```

#### 3.7.2 Two-Panel Layout

**Desktop (≥768px):** Left panel: Fixed 384px width (controls) | Right panel: Flex-fill (output)

**Left Panel Fields:**

| Field | Required | Constraint |
|---|---|---|
| Resume selector | Yes | Dropdown from user's saved resumes |
| Job Description | Yes | maxLength=5000, char counter shown |
| Company Name | Yes | maxLength=255 |
| Full Name | No | Pre-fills from user.name |
| Target Role | No | maxLength=255 |
| Target Location | No | maxLength=255 |
| Hiring Manager | No | maxLength=255 |
| Tone | No | Pill buttons (4 options) |
| Length | No | Radio buttons (3 options) |
| Custom Instructions | No | Textarea, 500-char limit with color counter |

**Right Panel States (Mutually Exclusive):**

| State | Condition |
|---|---|
| Spinner | isLoading (initial fetch) |
| Empty state | No letter, not loading, not generating |
| 3-step progress | Any of extracting, keywords-ready, generating |
| Error card | progressStep === 'error' |
| Letter controls | coverLetter !== null and step is idle or done |

**3-Step Progress UI:**
1. "Scanning resume and job description" (active during `extracting`)
2. "Analyzing keyword matches" (active during `keywords-ready`, badges shown)
3. "Writing your ATS-optimized cover letter" (active during `generating`)

#### 3.7.3 Letter Output Section

**Components:**
- Editable textarea (`font-mono`, `flex-1`)
- Word count with color feedback:
  - 🟢 Green: 200-450 words
  - 🟡 Yellow: 150-199 or 451-550 words
  - 🔴 Red: Otherwise
- "Revert to AI Original" link (shown when `editableContent !== generatedcontent`)
- ATS Keyword Coverage badges (live, computed client-side by `editableContent.toLowerCase().includes(keyword)`)
- Action bar: "Save Changes" | "Download PDF" | "Download .txt" | "Regenerate" (with confirm dialog)

### 3.8 Export Functionality

#### 3.8.1 PDF Export

```javascript
// Wrap editableContent in <p> tags
const html = `<p style="white-space: pre-wrap;">${editableContent}</p>`;
// POST to existing Puppeteer endpoint
const response = await axios.post('/api/export/pdf-from-html', {html});
// Trigger browser download
```

#### 3.8.2 TXT Export

```javascript
const blob = new Blob([editableContent], {type: 'text/plain'});
const url = URL.createObjectURL(blob);
const anchor = document.createElement('a');
anchor.href = url;
anchor.download = `Cover_Letter_${companyName}.txt`;
anchor.click();
```

### 3.9 Business Rules

| Rule | Enforcement |
|---|---|
| Multiple letters per resume | No UNIQUE constraint; each letter has own UUID |
| Standalone letters | resumeid nullable; letter can exist without resume |
| Cascade delete | Deleting resume auto-deletes associated cover letters |
| Revert safety | generatedcontent never overwritten on save |
| Keyword coverage | Live, client-side computed as user types |
| Word count feedback | Color-coded: green (ideal), yellow (acceptable), red (too short/long) |
| Confirm overwrite | Dialog shown if user clicks "Generate" when letter exists |
| Custom instructions cap | 500 chars (backend validator + frontend counter) |
| Job description cap | 5000 chars (frontend maxLength + backend validator) |

### 3.10 API Endpoints Summary

| Method | Endpoint | Rate Limited | Description |
|---|---|---|---|
| POST | /api/cover-letter/extract-keywords | Yes (aiLimiter) | Extract matched/missing keywords |
| POST | /api/cover-letter/generate | Yes (aiLimiter) | Generate cover letter (upsert) |
| GET | /api/cover-letter | No | List current user's letters (most recent 10) |
| GET | /api/cover-letter/resume/{resumeId} | No | List all letters for a specific resume |
| GET | /api/cover-letter/{id} | No | Fetch single letter by UUID |
| PUT | /api/cover-letter/{id} | No | Save user edits (content only) |
| DELETE | /api/cover-letter/{id} | No | Delete letter by UUID |

---

## 4. Feature 3: AI Analysis System

### 4.1 Business Logic Overview

The AI Analysis feature provides fresh graduates with intelligent feedback on their resume's competitiveness for junior roles. It delivers three key metrics:

- **Match Percentage** — job fit
- **ATS Score** — formatting compliance
- **Improvement Suggestions** — actionable recommendations

Analysis results are cached to avoid redundant API calls.

### 4.2 Core Workflow

```
Resume Submitted (POST /api/resume/build)
↓
generateResume() called internally
↓ (single GPT-4o-mini call)
Output:
  - resumeText (formatted resume)
  - matchPercentage (0-100)
  - aiAnalysis: {strengths[], weaknesses[], suggestions[]}
↓
Stored in resumes.aianalysis JSONB
↓
User navigates to /resume/{id}
↓
Displays:
  - Match percentage badge (color-coded)
  - 3-5 strengths/weaknesses/suggestions
  - Optional: ATS Score (separate API call)
  - Optional: Detailed improvements (separate API call)
```

### 4.3 Analysis Types

#### 4.3.1 Match Percentage (Generated on Submit)

**When:** Automatically during `POST /api/resume/build`

**AI Logic:**
- Input: Transformed resume data (flattened skills, education, experience) + `targetRole`, `targetCountry`, `targetCity` (optional)
- GPT-4o-mini evaluation:
  1. Alignment between user background and target role
  2. Experience level appropriateness for junior positions
  3. Geographic fit (target country/city)
- Output: `matchPercentage: number (0-100)` + `aiAnalysis: {strengths[], weaknesses[], suggestions[]}` (3-5 items each)

**Storage:**
```sql
UPDATE resumes
SET matchpercentage = $1,
    aianalysis = $2   -- JSONB: {strengths, weaknesses, suggestions}
WHERE id = $3;
```

**Frontend Display:**
- 🟢 Green (≥80): High match
- 🟡 Yellow (60-79): Moderate match
- 🔴 Red (<60): Low match
- Expandable sections for strengths/weaknesses/suggestions

#### 4.3.2 ATS Score (On-Demand, Cached)

**Endpoint:** `POST /api/analysis/ats-score`

**Backend Logic:**
1. Check `resumes.aianalysis.atsBreakdown`:
   - IF exists → Return cached data (no GPT call)
   - ELSE → Call GPT-4o-mini for ATS analysis
2. Evaluate 3 dimensions and calculate `totalScore`
3. Extract keywords: `{matched: string[], missing: string[]}`
4. Store in `resumes.aianalysis.atsBreakdown` JSONB

**ATS Scoring Criteria:**

| Dimension | Max Points | Criteria |
|---|---|---|
| Format Compliance | 40 | Simple layout (20), standard fonts (10), no images/tables (10) |
| Keyword Match | 40 | Presence of JD keywords (if jobdescription provided); otherwise, role-based keywords |
| Section Completeness | 20 | Contact (5), Education (5), Summary (5), Experience (5) |

**Total Score:** 0-100 (sum of three dimensions)

**Frontend Display:**
- SVG donut chart (r=54, 128x128 viewBox)
- 🟢 Green (#16a34a): ≥80 | 🟡 Yellow (#ca8a04): 60-79 | 🔴 Red (#dc2626): <60
- Center: `totalScore / 100`
- Below: Three sub-score rows with badge labels

#### 4.3.3 Improvement Suggestions (On-Demand, Cached)

**Trigger:** User clicks "Get Improvement Suggestions"

**Endpoint:** `POST /api/analysis/improve`

**Backend Logic:**
1. Check `resumes.aianalysis.improvements`:
   - IF exists AND `!forceRefresh` → Return cached data
   - ELSE → Call GPT-4o-mini for detailed suggestions
2. AI generates section-by-section recommendations:
   - **Summary:** Rewrite suggestions
   - **Experience:** Action verb improvements, quantification
   - **Skills:** Missing technical skills for target role
   - **Education:** Coursework/project highlights
3. Store in `resumes.aianalysis.improvements` JSONB

**Frontend Display:**
- Accordion/collapsible sections per category (Summary, Experience, Skills, Education)
- Each suggestion with "Apply" button (future feature)

### 4.4 Re-Analysis System

#### 4.4.1 Trigger Conditions

Users can trigger re-analysis when:
- Target role/country changes
- Job description updated
- Resume content significantly edited

#### 4.4.2 Re-Analysis Logic

**Endpoint:** `POST /api/analysis/reanalyze`

**Request Payload:**
```json
{
  "resumeId": "uuid-v4",
  "targetRole": "Software Engineer",
  "targetCountry": "United States",
  "targetCity": "San Francisco",
  "jobDescription": "string (max 5000 chars)"
}
```

**Process:**
1. Fetch resume + formdata from database
2. Build `resumeText` (parsedtext for Path A, `buildResumeTextFromFormData` for Path B)
3. Call `generateResume()` with new parameters
4. UPDATE resumes SET `matchpercentage` + `aianalysis` (clears `atsBreakdown` and `improvements` → forces recalculation)
5. INSERT INTO `analysishistory`: New row with targetrole, jobdescription, matchpercentage, aianalysis
6. Return new analysis data

> **Key Behavior:** Clears cached `atsBreakdown` and `improvements` (user must re-request). Creates new `analysishistory` entry (preserves old analysis for comparison).

### 4.5 Analysis History

#### 4.5.1 Database Schema

```sql
CREATE TABLE analysishistory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resumeid UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  targetrole VARCHAR(255),
  jobdescription TEXT,
  matchpercentage INTEGER,
  aianalysis JSONB,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysishistory_resumeid ON analysishistory(resumeid);
```

#### 4.5.2 History Display

**Endpoint:** `GET /api/analysis/history/{resumeId}`

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "targetrole": "Software Engineer",
      "jobdescription": "...",
      "matchpercentage": 85,
      "aianalysis": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "suggestions": ["..."]
      },
      "createdat": "2026-03-18T10:00:00Z"
    }
    // Last 5 entries, DESC by createdat
  ]
}
```

**Frontend Display:**
- Panel below current analysis (shown only when `history.length > 1`)
- Clicking an entry restores old matchPercentage, strengths, weaknesses, suggestions
- Active entry highlighted in indigo
- Match badge color-coded (green/yellow/red)

### 4.6 AI Configuration Summary

| Analysis Type | Model | Temperature | Response Format | Cache Behavior |
|---|---|---|---|---|
| Match Percentage | GPT-4o-mini | 0.3 | JSON | Generated once on submit, stored in aianalysis |
| ATS Score | GPT-4o-mini | 0.3 | JSON | Cached in aianalysis.atsBreakdown, cleared on re-analyze |
| Improvements | GPT-4o-mini | 0.4 | JSON | Cached in aianalysis.improvements, cleared on re-analyze |
| Re-Analysis | GPT-4o-mini | 0.3 | JSON | Overwrites matchpercentage + aianalysis, new history entry |

### 4.7 Business Rules

| Rule | Enforcement |
|---|---|
| Initial analysis | Automatic on resume submission; no manual trigger |
| ATS score caching | Stored in aianalysis.atsBreakdown; no redundant GPT calls unless re-analyzed |
| Improvement caching | Stored in aianalysis.improvements; forceRefresh flag bypasses cache |
| Re-analysis clears cache | Clears atsBreakdown and improvements; forces recalculation on next request |
| History limit | Last 5 entries per resume (frontend display); database retains all |
| Color coding | Match % and ATS Score: Green (≥80), Yellow (60-79), Red (<60) |
| Job description optional | ATS keyword match scores 0 if no JD provided; uses role-based keywords instead |

### 4.8 API Endpoints Summary

| Method | Endpoint | Rate Limited | Description |
|---|---|---|---|
| POST | /api/analysis/match | No | Get/compute match percentage (cached in aianalysis) |
| POST | /api/analysis/ats-score | No | Get/compute ATS score (cached in aianalysis.atsBreakdown) |
| POST | /api/analysis/improve | No | Get/compute improvement suggestions (cached in aianalysis.improvements) |
| POST | /api/analysis/reanalyze | Yes (aiLimiter) | Re-run analysis with new parameters; clears cache; creates history entry |
| GET | /api/analysis/history/{resumeId} | No | Fetch last 5 analysis history entries |

---

## 5. Cross-Feature Data Relationships

### 5.1 Database Relationship Diagram

```
users (id, email, password, isemailverified, name)
↓ CASCADE DELETE
resumes (id, userid, parsedtext, matchpercentage, aianalysis, templateid, status)
↓ CASCADE DELETE
├── resumedata (resumeid, formdata JSONB)
├── analysishistory (resumeid, userid, matchpercentage, aianalysis, createdat)
└── coverletters (resumeid NULLABLE, userid, content, generatedcontent, tone)
```

**Key Constraints:**
- All foreign keys use `ON DELETE CASCADE`
- `coverletters.resumeid` is nullable (supports standalone letters)
- `resumedata.formdata` stores raw frontend format (nested skills)
- `resumes.aianalysis` stores cached analysis data (strengths, weaknesses, atsBreakdown, improvements)

### 5.2 Data Flow Across Features

**Resume Building → Cover Letter:**
```
User builds resume → resumeId stored
↓
User clicks "Generate Cover Letter"
↓
Resume data fetched (parsedtext OR formdata)
↓
Keyword extraction uses resumeText
↓
Cover letter generated with resume context
```

**Resume Building → AI Analysis:**
```
User submits resume → POST /api/resume/build
↓
generateResume() called internally
↓
matchPercentage + aiAnalysis generated
↓
Stored in resumes table
↓
User views /resume/{id}
↓
Optional: ATS Score, Improvements (separate API calls, cached)
```

**Cover Letter → AI Analysis:**
- No direct dependency
- Cover letters operate independently
- Keywords from cover letter generation NOT used in resume analysis

### 5.3 Shared AI Services

| Service | Used By | Configuration |
|---|---|---|
| sanitizePromptInput() | Resume building, cover letter, analysis | Strips injection phrases, control chars; max 8000 chars |
| generateResume() | Resume building, re-analysis | GPT-4o-mini, temp=0.3, JSON mode |
| skillsGenerator | Resume building | GPT-4o-mini, temp=0.3, 30-day cache |
| summaryGenerator | Resume building | GPT-4o-mini, temp=0.4, max 300 tokens |
| keywordExtractor | Cover letter | GPT-4o-mini, temp=0.3, JSON mode |
| coverLetterGenerator | Cover letter | GPT-4o-mini, temp=0.8, plain text |

---

## 6. Security & Rate Limiting

### 6.1 Authentication & Authorization

**Session-Based Auth:**
- Passport.js with PostgreSQL session store
- HTTP-only cookies (`connect.sid`)
- Email verification required before login
- Password reset flow via Resend email service

**Protected Routes:**
All `/api/resume`, `/api/cover-letter`, `/api/analysis` routes require `isAuthenticated` middleware.

**Ownership Verification:**
Every database query joins against `resumes.userid = req.user.id` to prevent unauthorized access.

### 6.2 Rate Limiting

| Route Group | Limit | Window | Scope |
|---|---|---|---|
| /api/ai/* | 10 requests | 15 min | Per IP (aiLimiter) |
| /api/auth/forgot-password | 5 requests | 1 hour | Per IP |
| /api/resume/parse-text | 10 requests | 15 min | Per IP |

**Applied to:**
- `POST /api/ai/generate-skills`
- `POST /api/ai/generate-summary`
- `POST /api/cover-letter/extract-keywords`
- `POST /api/cover-letter/generate`
- `POST /api/analysis/reanalyze`

### 6.3 Input Validation

**Backend Validation (express-validator):**
- All user inputs validated before reaching controller
- Returns `400 Bad Request` with detailed error messages
- Examples: `email` (valid format), `jobDescription` (max 5000 chars), `customInstructions` (max 500 chars), `resumeId` (UUID format)

**Frontend Validation:**
- Character counters for text inputs
- File size limits (profile photo: 2MB)
- Step-level validation in resume builder
- Disabled submit buttons when invalid

### 6.4 Prompt Injection Defense

```typescript
function sanitizePromptInput(text: string): string {
  // 1. Strip null bytes and control characters
  // 2. Replace injection phrases:
  //    - "ignore all previous instructions"
  //    - "you are now"
  //    - "system:", "<|assistant|>", "<SYS>"
  //    → Replaced with "[redacted]"
  // 3. Truncate to 8000 chars
  return sanitized;
}
```

**Applied to:** `jobDescription` before GPT calls, `customInstructions` in cover letter generation, user-supplied text in analysis prompts.

### 6.5 File Upload Security

**Resume Upload (Path A):**
- File type: PDF only
- Max size: 5MB (multer + client-side validation)
- Stored in `uploads/` directory with UUID filename
- Path traversal prevention via filename sanitization

**Profile Photo (Path B):**
- Client-side validation: JPEG/PNG, max 2MB
- Base64 encoding before transmission
- Stored in `resumedata.formdata` JSONB
- Size limits enforced via JSON body limit (10MB)

---

## 7. Future Enhancements (Post-MVP)

### 7.1 Planned Features

1. **Real-Time Job Market Integration** — Adzuna API for active job counts and salary ranges; Match % weighted by market demand
2. **Visual Score Dashboard** — Pie/bar chart breakdown per resume section; historical trend graphs
3. **Multiple Resume Versions** — Save different versions per target role; version comparison view
4. **In-App Resume Editing** — Edit exported resume without rebuilding; track changes with diff view
5. **Job Application Tracker** — Track submissions, interviews, follow-ups; integration with cover letter workflow
6. **Premium Templates** — Industry-specific paid designs; color customization per template
7. **Advanced Cover Letter Options** — Bulk generation for multiple job applications; additional tones (creative, technical, executive)

### 7.2 Monetization Strategy

**Free Tier (Current):**
- All 7 templates
- Unlimited resume builds
- AI resume analysis
- Cover letter generator (unlimited)

**Premium Tier ($9.99/month - Planned):**
- Exclusive premium templates
- Real-time job market data
- Priority AI processing (no rate limits)
- Color customization
- Advanced cover letter options
- Resume version history (unlimited)

---

## 8. Appendices

### 8.1 Database Migrations Log

| Migration | Description |
|---|---|
| 001 | Create users table |
| 002 | Create session table (PostgreSQL session store) |
| 003 | Create resumes table |
| 004 | Create resumedata table |
| 005 | Add status, templateid, aicache table |
| 018 | Add jobdescription to resumes |
| 019 | Create analysishistory table |
| 020 | Add name, isemailverified to users; create emailverificationtokens |
| 021 | Create passwordresettokens table |
| 022 | Create coverletters table (UNIQUE resumeid constraint) |
| 027 | Drop UNIQUE constraint on coverletters.resumeid; add jobtitle column |
| 028 | Make coverletters.resumeid nullable (standalone letters) |
| 029 | Update template thumbnails |

### 8.2 Technology Dependencies

**Backend:**
- `express` (4.x)
- `pg` (PostgreSQL client)
- `passport`, `express-session` (authentication)
- `bcrypt` (password hashing)
- `express-validator` (input validation)
- `openai` (GPT-4o-mini API)
- `puppeteer` (PDF generation)
- `pdf-parse` (PDF text extraction for Path A)
- `resend` (email service)

**Frontend:**
- `react` (18.x)
- `react-router-dom` (6.x)
- `axios` (HTTP client)
- `tailwindcss` (styling)
- `vite` (build tool)

### 8.3 Glossary

| Term | Definition |
|---|---|
| Path A | Resume workflow where user uploads existing PDF for analysis |
| Path B | Resume workflow where user builds resume from scratch via form |
| ATS | Applicant Tracking System; software used by employers to screen resumes |
| Match Percentage | AI-generated score (0-100) indicating job fit for target role/location |
| formdata | JSONB column storing raw frontend ResumeFormData structure |
| parsedtext | TEXT column storing AI-generated resume text (Path B) or extracted PDF text (Path A) |
| aianalysis | JSONB column storing cached AI analysis results (strengths, weaknesses, atsBreakdown, improvements) |
| Draft | Incomplete resume saved via /api/resume/draft/save for later editing |
| Template-Aware PDF | Export method where React template is rendered client-side, HTML sent to Puppeteer |
| Standalone Letter | Cover letter not attached to any resume (coverletters.resumeid = null) |
