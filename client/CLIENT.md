# Client Documentation (For Server Reference)

## Overview
React 18 + TypeScript + Vite SPA that communicates with the Express backend via REST API.

## API Client Configuration

### Base Setup
```typescript
// client/src/utils/api.ts
const apiClient = axios.create({
  baseURL: '/api',  // All requests are prefixed with /api
  withCredentials: true,  // Sends session cookies
});
```

**IMPORTANT**: Use relative paths WITHOUT the `/api` prefix:
- ✅ `apiClient.post('/auth/login', data)`
- ✅ `apiClient.get('/resume/list')`
- ❌ `apiClient.post('/api/auth/login', data)` (creates `/api/api/auth/login`)

## Authentication Flow

### Session-Based Auth
- Client sends credentials to `/auth/login` or `/auth/register`
- Server sets session cookie
- Client includes `withCredentials: true` in all requests
- Client checks auth status via `/auth/me` on mount

### Auth State Management
```typescript
// client/src/hooks/useAuth.ts
const { user, loading, login, register, logout } = useAuth();
// user: { id: string, email: string, name: string } | null
```

## Data Structures Sent to Server

### ResumeFormData (Complete Structure)
```typescript
interface ResumeFormData {
  // Step 1: Personal Information + Target Position
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[];  // Up to 3 custom links
  profilePhoto?: string;              // Base64 DataURL (image/*), max 2MB
  targetRole: string;
  targetIndustry: string;
  targetCountry: string;
  targetCity?: string;

  // Step 2: Education
  education: Array<{
    degreeType: string;
    major: string;
    university: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework: string;
    honors?: string;
  }>;

  // Step 3: Experience
  experience: Array<{
    type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
    company: string;
    role: string;
    duration: string;
    responsibilities: string;
    industry?: string;
  }>;

  // Step 4: Projects
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    role: string;
    link?: string;
  }>;

  // Step 5: Skills (NESTED STRUCTURE)
  skills: {
    technical: Array<{
      category: string;   // e.g., "Programming Languages"
      items: string[];    // e.g., ["Python", "JavaScript"]
    }>;
    soft: string[];       // e.g., ["Communication", "Teamwork"]
    languages: Array<{
      language: string;       // e.g., "English"
      proficiency: string;    // "native" | "fluent" | "professional" | "intermediate" | "basic"
    }>;
  };

  // Step 6: Professional Summary
  professionalSummary: string;

  // Step 7: Additional
  certifications?: string;
  extracurriculars?: string;
}

interface AdditionalLink {
  id: string;
  label: 'GitHub' | 'Behance' | 'Medium' | 'Dribbble' | 'YouTube' | 'Custom';
  customLabel?: string;  // Only when label === 'Custom'
  url: string;
}
```

## API Endpoints Used by Client

### Authentication
- `POST /auth/register` — `{ name, email, password }` → `{ user: { id, email, name } }`
- `POST /auth/login` — `{ email, password }` → `{ user: { id, email, name } }`
- `POST /auth/logout` → `{ message }`
- `GET /auth/me` → `{ user: { id, email, name } }` or 401

### Resume Management
- `GET /resume` → `{ resumes: [{ id, target_role, target_country, target_city, match_percentage, ats_score, created_at }] }`
- `GET /resume/:id` → `{ resume: { id, user_id, file_path, parsed_text, target_role, target_country, target_city, job_description, match_percentage, ats_score, ai_analysis, template_id, form_data, created_at } }`
- `GET /resume/:id/file` → Binary PDF (`application/pdf`) — **Path A only**; 404 if no uploaded file
- `POST /resume/build` — `{ ...ResumeFormData, templateId }` → `{ resume }`
- `POST /resume/upload` — `multipart/form-data` with `file` (PDF, max 5MB) + `targetRole`, `targetCountry`, `targetCity?`, `jobDescription?` → `{ resume }`
- `DELETE /resume/:id` → `{ message }`
- `POST /resume/:id/switch-template` — `{ templateId: string (UUID) }` → `{ message, template }`
  - Returns 403 if user's subscription tier is too low for the template

### Draft Management
- `POST /resume/draft/save` — `{ formData, resumeId? }` → `{ success, resumeId, message }`
- `GET /resume/draft/:id` → `{ resumeId, formData, updatedAt }`

### Templates
- `GET /templates` → `{ templates: [{ id, name, displayName, description, category, thumbnailUrl, isAtsFriendly, requiredTier, isLocked }], userTier }`
- `GET /templates/:id` → `{ template: { id, name, displayName, description, category, thumbnailUrl, isAtsFriendly, requiredTier } }`
  - Note: `configuration` field no longer returned — template styling lives in React components

### Analysis
- `POST /analysis/match` — `{ resumeId }` → `{ matchPercentage, strengths, weaknesses, suggestions }`
- `POST /analysis/ats-score` — `{ resumeId }` → `{ atsBreakdown: { formatCompliance, keywordMatch, sectionCompleteness, totalScore, keywords: { matched, missing } } }`
  - Results cached in `resumes.ai_analysis` JSONB; subsequent calls return cached data without OpenAI call
- `POST /analysis/improve` — `{ resumeId, forceRefresh? }` → `{ suggestions, detailed }`
  - Results cached; pass `forceRefresh: true` to bypass
- `POST /analysis/reanalyze` — `{ resumeId, targetRole, targetCountry?, targetCity?, jobDescription? }` → `{ matchPercentage, strengths, weaknesses, suggestions }`
  - Clears cached `atsBreakdown` and `improvements`; inserts a new row in `analysis_history`
- `GET /analysis/history/:resumeId` → `{ history: AnalysisHistoryEntry[] }` — last 5 entries DESC

```typescript
interface AnalysisHistoryEntry {
  id: string;
  target_role: string | null;
  job_description: string | null;
  match_percentage: number;
  ai_analysis: { strengths?: string[]; weaknesses?: string[]; suggestions?: string[] };
  created_at: string;  // ISO timestamp
}
```

### Export
- `POST /export/pdf-from-html` — `{ html: string }` → PDF binary (`application/pdf`)
  - Client renders React template to HTML via `flushSync`+`createRoot`, then POSTs the full HTML string
  - Request body up to 10 MB (base64 photos)
- `GET /export/markdown/:resumeId` → Markdown file download (`text/markdown`)

## Data Transformation Notes

### Skills Structure
**Client sends** nested structure:
```javascript
{
  technical: [
    { category: "Programming Languages", items: ["Python", "JavaScript"] },
    { category: "Frameworks", items: ["React", "Express"] }
  ],
  soft: ["Communication", "Teamwork"],
  languages: [
    { language: "English", proficiency: "fluent" }
  ]
}
```

**Server transforms** to flat format for export templates:
```javascript
{
  technicalSkills: "Programming Languages: Python, JavaScript; Frameworks: React, Express",
  softSkills: ["Communication", "Teamwork"],
  languages: [{ name: "English", proficiency: "fluent" }]
}
```

### Profile Photo
- Stored as Base64 DataURL (`data:image/jpeg;base64,...`) in `formData.profilePhoto`
- Photo upload shown only when selected template supports it — determined client-side via `SUPPORTS_PHOTO` map in `ResumeBuilderPage.tsx` (not from server)
- The server passes this through as-is in the JSONB `form_data` column

## Error Handling

### Client Expectations
- **200/201**: Success with JSON body
- **400**: Validation error `{ message, errors? }`
- **401**: Not authenticated → redirects to `/login`
- **403**: Access forbidden (e.g., template requires paid subscription)
- **404**: Not found `{ message }`
- **500**: Server error `{ message }`

### Error Interceptor
Client axios interceptor:
- Catches 401 → redirects to `/login`
- Shows toast notifications for failed requests

## Client-Side Routes
- `/` — Home page
- `/login` — Login
- `/register` — Register
- `/dashboard` — User dashboard (protected)
- `/upload` — Resume upload (protected)
- `/build` — New resume builder (protected)
- `/build/:id` — Edit existing resume (protected)
- `/resume/:id` — Resume analysis page (protected)

All routes except `/`, `/login`, `/register` require authentication.

## ResumeAnalysisPage Features (Phase 5)

### Original PDF Viewer (Path A only)
- `hasFile` state: set when `resumeRes.resume.file_path` is not null
- Toggle button "View Original Resume ↓ / ↑" — only shown when `hasFile` is true
- Reveals an `<iframe src="/api/resume/${id}/file">` with `height="800px"`
- Uses native browser PDF rendering — no packages

### ATS Score Donut Chart
- `AtsScoreCard.tsx` renders a pure SVG donut (r=54, 128×128 viewBox)
- Color: green `#16a34a` if ≥80, yellow `#ca8a04` if ≥60, red `#dc2626` otherwise
- Center shows `{totalScore}` + `/100`; below: three sub-score rows with badge labels
- No `ProgressBar` component — keyword badges unchanged

### Analysis History Panel
- `history: AnalysisHistoryEntry[]` fetched via `getAnalysisHistory(id)` in initial `Promise.all`
- Panel renders below `ImprovementSuggestions` only when `history.length > 1`
- Clicking an entry: restores `matchPercentage`, `strengths`, `weaknesses`, `suggestions`; resets `atsBreakdown` and `detailed` to null
- Active entry highlighted in indigo; match % badge color-coded green/yellow/red
- History refreshed automatically after a successful re-analyze

## Template System (Client-Side)

### TemplateId Union
```typescript
// client/src/components/templates/types.ts
type TemplateId =
  | 'modern_minimal'
  | 'creative_bold'
  | 'professional_classic'
  | 'tech_focused'
  | 'healthcare_pro'
  | 'warm_creative'
  | 'sleek_director'
  | 'dark_ribbon_modern'
  | 'modern_minimalist_block'
  | 'editorial_earth_tone';
```

### Per-Template Components
Each template is a self-contained React component in `client/src/components/templates/`.
Templates own all their layout, padding, colors, and section rendering — no shared config object.

| TemplateId                  | Layout                  | Accent Color                | Photo |
|-----------------------------|-------------------------|-----------------------------|-------|
| `modern_minimal`            | Single-column           | Blue `#2563eb`              | yes   |
| `creative_bold`             | 2-col sidebar           | Purple `#7c3aed`            | yes   |
| `professional_classic`      | Single-column           | Navy `#1e3a5f` + gold       | yes   |
| `tech_focused`              | Skills-first            | Sky `#0ea5e9`               | no    |
| `healthcare_pro`            | Teal header band        | Teal `#0f766e`              | yes   |
| `warm_creative`             | Warm header band        | Terracotta `#d84315`        | yes   |
| `sleek_director`            | Cylinder sidebar        | Charcoal + gray, timeline   | yes   |
| `dark_ribbon_modern`        | 2-col dark sidebar      | Charcoal `#2b2b2b`, ribbon  | yes   |
| `modern_minimalist_block`   | 2-col dark sidebar      | Charcoal `#454545`          | yes   |
| `editorial_earth_tone`      | 2-col pill sidebar      | Earth tones `#483930`       | yes   |

### Key Files
- `client/src/components/templates/types.ts` — `TemplateId`, `ResumeTemplateProps`
- `client/src/components/templates/helpers/renderingHelpers.ts` — `formatHeading()`, `parseResponsibilities()`
- `client/src/components/templates/ResumeTemplateSwitcher.tsx` — resolves templateId → component
- `client/src/components/live-preview/templateTypes.ts` — simplified registry (`TemplateBasicInfo[]`) for the picker UI only
- `client/src/components/live-preview/TemplateRenderer.tsx` — thin shim → ResumeTemplateSwitcher

### Photo Support
Photo upload is shown in PersonalInfoStep when the selected template supports it.
Check via the `SUPPORTS_PHOTO` constant in `ResumeBuilderPage.tsx`:
```typescript
const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern_minimal: true, creative_bold: true, professional_classic: true,
  healthcare_pro: true, warm_creative: true, sleek_director: true,
  dark_ribbon_modern: true, modern_minimalist_block: true, editorial_earth_tone: true,
};
```

### Hooks
```typescript
// List templates from server
const { templates, userTier, loading } = useTemplates();

// Switch template for a resume
const { doSwitch, switching, error } = useTemplateSwitch(resumeId, onSwitch);
```

## Development Server
- Port: 5173 (Vite default, may use 5174/5175 if occupied)
- Proxy: `/api/*` → `http://localhost:5000`
- HMR enabled

## Build Output
- `client/dist/` — static files with hashed filenames
- In production, the server serves this directory via `express.static` and sends `index.html` for all non-API routes (SPA fallback)

## Production Notes
- Set `NODE_ENV=production` on the server — enables static file serving of `client/dist/`
- Server serves client bundle from `server/dist/../../client/dist` (resolved relative to `server/dist/app.js`)
- API routes (`/api/*`) are handled first; only non-API routes fall through to SPA fallback
- Cookie `secure: true` is set in production — requires HTTPS
