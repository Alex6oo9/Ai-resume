# Client Documentation (For Server Reference)

## Overview
React 18 + TypeScript + Vite SPA that communicates with the Express backend via REST API.

## API Client Configuration

### Base Setup
```typescript
// client/src/utils/api.ts
const apiClient = axios.create({
  baseURL: '/api',        // All requests are prefixed with /api
  withCredentials: true,  // Sends session cookies
  timeout: 10000,         // 10-second timeout
});
```

**IMPORTANT**: Use relative paths WITHOUT the `/api` prefix:
- ✅ `apiClient.post('/auth/login', data)`
- ✅ `apiClient.get('/resume/list')`
- ❌ `apiClient.post('/api/auth/login', data)` (creates `/api/api/auth/login`)

### Response Interceptors
Axios interceptors dispatch DOM events consumed by `ConnectivityContext`:
- Successful response → dispatches `server:up` event
- Network error (no response) → dispatches `server:down` event with error code
- HTTP 5xx → dispatches `server:error` event with status code
- 401/403 → passes through silently (handled by auth flow)

## Authentication Flow

### Session-Based Auth with Email Verification
- Client sends credentials to `/auth/register` — does NOT auto-login
- User must verify email via link sent to their inbox
- After verification, user logs in via `/auth/login`
- Server sets session cookie on successful login
- Client includes `withCredentials: true` in all requests
- Client checks auth status via `/auth/me` on mount
- Login returns 403 if email not verified (with resend option)

### Google OAuth
- "Sign in with Google" / "Sign up with Google" button on Login and Register pages
- Implemented as a plain `<a href="/api/auth/google">` (browser navigation, not an axios call)
- After Google authenticates the user, server redirects to `/dashboard`
- `AuthContext` restores session state via `GET /auth/me` as normal — no special client handling needed
- Component: `client/src/components/GoogleSignInButton.tsx` — accepts `mode="signin"` (default) or `mode="signup"`

### Auth State Management
```typescript
// client/src/contexts/AuthContext.tsx
// AuthProvider wraps useAuth() once at the top level; consumers call:
const { user, loading, login, register, logout, setUser } = useAuthContext();
// user: { id: string, email: string, name?: string } | null
// register(email, password, name?) — no auto-login, returns void
```

## Context Provider Stack

The app wraps three providers in this order (outermost first):

```
ThemeProvider
  ConnectivityProvider
    AuthProvider
      RouterProvider (AppLayout + ProtectedLayout)
```

### ThemeProvider (`client/src/contexts/ThemeContext.tsx`)
- Manages dark/light mode preference
- Reads `localStorage` for saved preference; falls back to `prefers-color-scheme` on first visit
- Adds/removes `dark` class on `document.documentElement` for Tailwind dark: utilities
- `useTheme()` returns `{ isDark: boolean, toggleTheme: () => void }`

### ConnectivityProvider (`client/src/contexts/ConnectivityContext.tsx`)
- Monitors server health via axios interceptor events
- When server is detected down: polls `GET /api/health` every 10 seconds
- `useConnectivity()` returns:
  ```typescript
  {
    isServerDown: boolean;      // true on ECONNREFUSED / ETIMEDOUT
    isServerDegraded: boolean;  // true on HTTP 5xx
    retryCount: number;
    manualRetry: () => void;    // triggers immediate health check
  }
  ```
- Dispatches custom DOM events: `server:down`, `server:error`, `server:up`, `server:recovered`
- Polling only starts after first failure (event-driven, not continuous)

### Server-Down UX (`client/src/components/shared/ServerDownBanner.tsx`)
- Sticky alert rendered in `AppLayout` (visible on all pages)
- Red banner when `isServerDown`: "Unable to reach the server. Retrying automatically…"
- Yellow banner when `isServerDegraded`: "Server is experiencing issues. Some features may be unavailable."
- "Retry now" button calls `manualRetry()`
- Listens to `server:recovered` event to show success toast and auto-dismiss

### Auth Pages
- `/login` — supports `?verified=true`, `?reset=true` success banners, and `?error=oauth` failure banner (Google OAuth callback failed)
- `/register` — includes optional name field, shows "check email" on success
- `/verify-email?token=<hex>` — verifies email, links to login
- `/forgot-password` — sends password reset email
- `/reset-password?token=<hex>` — sets new password

### Auth API Functions (`client/src/utils/api.ts`)
```typescript
verifyEmail(token: string)
resendVerification(email: string)
forgotPassword(email: string)
resetPassword(token: string, password: string)
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
- `GET /auth/google` — **browser navigation only** (not axios). Initiates Google OAuth; redirects to Google consent screen.
- `GET /auth/google/callback` — handled server-side; redirects to `/dashboard` on success or `/login?error=oauth` on failure.

### Resume Management
- `GET /resume` → `{ resumes: [{ id, target_role, target_country, target_city, match_percentage, ats_score, created_at }] }`
- `GET /resume/:id` → `{ resume: { id, user_id, file_path, parsed_text, target_role, target_country, target_city, job_description, match_percentage, ats_score, ai_analysis, template_id, form_data, created_at } }`
- `GET /resume/:id/file` → Binary PDF (`application/pdf`) — **Path A only**; 404 if no uploaded file
- `POST /resume/build` — `{ ...ResumeFormData, templateId }` → `{ resume }`
- `POST /resume/upload` — `multipart/form-data` with `file` (PDF, max 5MB) + `targetRole`, `targetCountry`, `targetCity?`, `jobDescription?` → `{ resume }`
- `POST /resume/parse-text` — `multipart/form-data` with `file` (PDF) → parsed text (rate-limited)
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

### Cover Letters
Multiple cover letters allowed per resume (migration 027 dropped `UNIQUE(resume_id)`). Letters are keyed by their own UUID, not by `resumeId`.

- `GET /cover-letter/` → `{ letters: CoverLetter[] }` — all letters for current user (limit 10, DESC by updated_at)
- `GET /cover-letter/resume/:resumeId` → `{ letters: CoverLetter[] }` — all letters attached to a specific resume
- `GET /cover-letter/:id` → `{ letter: CoverLetter }` — single letter by UUID
- `POST /cover-letter/extract-keywords` — `{ resumeId?, resumeText?, jobDescription }` → `{ keywords: { matched: string[], missing: string[] } }`
- `POST /cover-letter/generate` — `{ resumeId?, resumeText?, jobTitle, companyName, jobDescription, tone?, wordCountTarget?, keywords?, whyThisCompany?, achievementToHighlight? }` → `{ letter: CoverLetter }`
- `PUT /cover-letter/:id` — `{ content: string }` → `{ letter: CoverLetter }`
- `DELETE /cover-letter/:id` → `{ message }`
- `POST /cover-letter/:id/regenerate` — `{ jobTitle, companyName, jobDescription, tone?, wordCountTarget?, keywords?, whyThisCompany?, achievementToHighlight? }` → `{ letter: CoverLetter }` — requires letter to have a `resume_id` (standalone letters cannot be regenerated)
- `POST /cover-letter/:id/improve` — `{ whyThisCompany?, achievementToHighlight? }` → `{ letter: CoverLetter }`

```typescript
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';  // word targets: 150 / 250 / 400

interface CoverLetter {
  id: string;
  resume_id: string | null;   // null for standalone letters
  user_id: string;
  job_title: string | null;   // added in migration 027
  content: string;
  generated_content: string;
  tone: string;
  word_count_target: number;
  created_at: string;
  updated_at: string;
}
```

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

Router uses `createBrowserRouter` with data router pattern (required for `useBlocker` navigation guards):
- **AppLayout** — layout route: renders `Header` + `<Outlet>` + toast notifications; handles loading spinner
- **ProtectedLayout** — layout route: redirects to `/login` if not authenticated via `useAuthContext()`

Routes:
- `/` — Home page (public)
- `/login` — Login (public)
- `/register` — Register (public)
- `/dashboard` — User dashboard (protected) — bento grid layout with unified document grid
- `/upload` — Resume upload (protected)
- `/build` — New resume builder (protected, includes `useBlocker` for unsaved changes)
- `/build/:id` — Edit existing resume (protected, includes `useBlocker` for unsaved changes)
- `/resume/:id` — Resume analysis page (protected)
- `/cover-letter/new` — Cover letter editor (protected)
- `/verify-email` — Email verification (public, shown after register)
- `/forgot-password` — Password reset request (public)
- `/reset-password` — Password reset form (public)
- `/thumbnail-preview?template=<templateId>` — **Unauthenticated, no header** — renders a template with sample data at 816×1056px; used by Puppeteer screenshot script; signals readiness via `data-thumbnail-ready="true"` attribute

Authentication: `ProtectedRoute.tsx` was deleted; `ProtectedLayout` layout route handles redirects based on `useAuthContext()`.

Header is hidden on `/build*` and `/thumbnail-preview` routes (full-page builder / screenshot target).

## UI Component Library

### Primitive Components (`client/src/components/ui/`)
Reusable styled primitives used throughout the app:

| File | Export | Purpose |
|------|--------|---------|
| `button.tsx` | `Button` | Variants: `default`, `outline`, `ghost`; sizes: `default`, `sm`, `icon` |
| `input.tsx` | `Input` | Styled `<input>` with focus ring, hover states |
| `label.tsx` | `Label` | `<label>` with peer-disabled handling |
| `select.tsx` | `Select` | Context-pattern select with accessibility |
| `textarea.tsx` | `Textarea` | Min 120px height, resize-y, consistent styling |

### Tailwind Class Utility (`client/src/lib/utils.ts`)
```typescript
import { cn } from '../lib/utils';
// cn() merges clsx + tailwind-merge — safely combines conditional Tailwind classes
cn('px-4', isActive && 'bg-primary', 'rounded')
```

---

## Navigation Guards

### Unsaved Form Prevention
- `ConfirmLeaveModal` + `useBlocker` in `ResumeBuilderPage`: shows "Leave page?" confirmation when user tries to navigate away (via link, back button, close tab) with unsaved form changes
- Works only with the data router (`createBrowserRouter`) — required for `useBlocker` hook
- Modal wraps `<RouterProvider>` to intercept all navigation

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
  | 'modern'               // default (sort_order=0)
  | 'modern_yellow_split'
  | 'dark_ribbon_modern'
  | 'modern_minimalist_block'
  | 'editorial_earth_tone'
  | 'ats_clean'
  | 'ats_lined';
```

### Per-Template Components
Each template is a self-contained React component in `client/src/components/templates/`.
Templates own all their layout, padding, colors, and section rendering — no shared config object.
Templates use inline styles only (no Tailwind) for Puppeteer PDF compatibility.

| TemplateId                  | Layout                           | Accent Color                          | Photo | Thumbnail |
|-----------------------------|----------------------------------|---------------------------------------|-------|-----------|
| `modern`                    | Single-column centered header    | White, Inter font                     | yes   | `/thumbnails/modern.png` |
| `modern_yellow_split`       | 2-col yellow split               | Yellow accent                         | yes   | `/thumbnails/modern_yellow_split.png` |
| `dark_ribbon_modern`        | 2-col dark sidebar               | Charcoal `#2b2b2b`, ribbon headers    | yes   | `/thumbnails/dark_ribbon_modern.png` |
| `modern_minimalist_block`   | 2-col dark sidebar               | Charcoal `#454545`                    | yes   | `/thumbnails/modern_minimalist_block.png` |
| `editorial_earth_tone`      | 2-col vertical pill sidebar      | Earth tones `#483930`, beige bg       | yes   | `/thumbnails/editorial_earth_tone.png` |
| `ats_clean`                 | Single-column, no sidebar        | White `#ffffff`, text `#222222`       | no    | `/thumbnails/ats_clean.png` |
| `ats_lined`                 | Single-column, no sidebar        | Navy `#1a3557`, border-bottom h2      | no    | `/thumbnails/ats_lined.png` |

### Key Files
- `client/src/components/templates/types.ts` — `TemplateId`, `ResumeTemplateProps`
- `client/src/components/templates/ResumeTemplateSwitcher.tsx` — resolves templateId → component; defaults to `ModernTemplate`
- `client/src/components/live-preview/templateTypes.ts` — simplified registry (`TemplateBasicInfo[]`) for the picker UI — 7 templates, all `isPremium: false`; re-exports `TemplateId`; includes `thumbnailUrl` pointing to `/thumbnails/{id}.png`

### Photo Support
Photo upload is shown in PersonalInfoStep when the selected template supports it.
Check via the `SUPPORTS_PHOTO` constant in `ResumeBuilderPage.tsx`:
```typescript
const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern: true,
  modern_yellow_split: true,
  dark_ribbon_modern: true,
  modern_minimalist_block: true,
  editorial_earth_tone: true,
  // ats_clean and ats_lined do NOT support photo
};
```

### Template Thumbnails
Static PNG thumbnails (816×1056px, 2x scale) in `client/public/thumbnails/`.
Generated via `npm run generate:thumbnails` in the server package (requires both dev servers running).
See `context/Thumbnail.md` for the full generation workflow.

### Hooks
```typescript
// List templates from server
const { templates, userTier, loading } = useTemplates();

// Switch template for a resume
const { doSwitch, switching, error } = useTemplateSwitch(resumeId, onSwitch);
```

## E2E Tests (Playwright)

- Config: `client/playwright.config.ts`
- Tests: `client/e2e/`
- Browser: Chromium, 1 worker (sequential)
- Base URL: `http://localhost:5173`
- Run: `npx playwright test` (from `client/`)

Current test suites:
- `e2e/confirm-leave.spec.ts` — 5 tests for `ConfirmLeaveModal` (unsaved changes guard): modal appears on nav-away, "Leave anyway" navigates, "Keep editing" stays, dark mode styling, no modal on fresh form

---

## Development Server
- Port: 5173 (Vite default, may use 5174/5175 if occupied)
- Proxy: `/api/*` → `http://localhost:5000`
- HMR enabled

## Build Output
- `client/dist/` — static files with hashed filenames
- Deployed to **Vercel** (Root Directory: `client`, Output Directory: `dist`). A `client/vercel.json` provides SPA rewrites so all routes serve `index.html`.

## Production Notes
- Frontend deployed to **Vercel**: Root Directory = `client`, Build Command = `npm run build`, Output Directory = `dist`
- `client/vercel.json` rewrites all routes to `index.html` for React Router SPA navigation
- Backend deployed to **Render** (API only — no static file serving)
- The Vite dev proxy (`/api/*` → `http://localhost:5000`) handles local development; in production the frontend calls the Render backend URL directly — set `VITE_API_URL` or configure a Vercel rewrite to proxy `/api/*` to the Render service
- Cookie `secure: true` is set on the backend in production — requires HTTPS (both Vercel and Render provide this automatically)
