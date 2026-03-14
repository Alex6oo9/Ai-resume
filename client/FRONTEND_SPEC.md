# AI Resume Builder — Frontend Specification

> **Purpose:** Complete UI/UX reference for recreating this frontend. Covers every page, component, layout rule, button hierarchy, conditional rendering, and interaction pattern.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design System](#2-design-system)
3. [Navigation & Routing](#3-navigation--routing)
4. [Authentication Flow](#4-authentication-flow)
5. [Page-by-Page Layouts](#5-page-by-page-layouts)
   - 5.1 [Home Page (`/`)](#51-home-page-)
   - 5.2 [Login Page (`/login`)](#52-login-page-login)
   - 5.3 [Register Page (`/register`)](#53-register-page-register)
   - 5.4 [Verify Email Page (`/verify-email`)](#54-verify-email-page-verify-email)
   - 5.5 [Forgot Password Page (`/forgot-password`)](#55-forgot-password-page-forgot-password)
   - 5.6 [Reset Password Page (`/reset-password`)](#56-reset-password-page-reset-password)
   - 5.7 [Dashboard Page (`/dashboard`)](#57-dashboard-page-dashboard)
   - 5.8 [Resume Upload Page (`/upload`)](#58-resume-upload-page-upload)
   - 5.9 [Resume Builder Page (`/build`, `/build/:id`)](#59-resume-builder-page-build-buildid)
   - 5.10 [Resume Analysis Page (`/resume/:id`)](#510-resume-analysis-page-resumeid)
   - 5.11 [Cover Letter Page (`/cover-letter/new`)](#511-cover-letter-page-cover-letternew)
6. [Shared Components](#6-shared-components)
7. [Multi-Step Form Builder — Steps Detail](#7-multi-step-form-builder--steps-detail)
8. [Template System](#8-template-system)
9. [Interaction Patterns](#9-interaction-patterns)
10. [API Surface (Frontend Calls)](#10-api-surface-frontend-calls)
11. [Accessibility & Responsiveness](#11-accessibility--responsiveness)

---

## 1. Overview

**AI Resume Builder** is a React 18 + TypeScript SPA. It helps fresh graduates build ATS-optimized resumes or improve existing ones. There are two primary user paths:

| Path | Entry | Description |
|------|-------|-------------|
| **Path A: Upload & Analyze** | `/upload` | User uploads existing PDF resume → AI analyzes it → shows match %, ATS score, improvements |
| **Path B: Build from Scratch** | `/build` | User fills a 6-step form → AI generates resume content → live preview in chosen template → export PDF |

Both paths end at the **Resume Analysis Page** (`/resume/:id`). A **Cover Letter Generator** (`/cover-letter/new`) is also available standalone or linked from any resume.

**Tech stack:** React 18, TypeScript, TailwindCSS, Vite, React Router v6. No CSS files — all styling via Tailwind utility classes.

---

## 2. Design System

### 2.1 Color Palette

| Role | Value | Usage |
|------|-------|-------|
| **Primary** | `indigo-600` (`#4f46e5`) | Main CTAs, active nav, focus rings, links |
| Primary hover | `indigo-700` | Hover state for primary buttons |
| Primary light | `indigo-50` | Subtle backgrounds, active states |
| **Teal/Success alt** | `teal-600` / `emerald-600` | Cover Letter card, secondary CTAs |
| **Success** | `green-600` | Match ≥80%, saved state, verified icons |
| **Warning** | `yellow-600` (`#ca8a04`) | Match 60–79%, ATS 60–79 |
| **Error** | `red-600` (`#dc2626`) | Match <60%, ATS <60, error states |
| **Gray scale** | `gray-50` to `gray-900` | Backgrounds, borders, secondary text |
| Page background | `gray-50` | `min-h-screen bg-gray-50` |
| Card background | `white` | All content cards |
| Border default | `gray-200` | Cards, dividers |
| Text primary | `gray-900` | Headings |
| Text secondary | `gray-600` | Body, labels |
| Text muted | `gray-500` | Timestamps, subtitles |
| Text placeholder | `gray-400` | Input placeholders |

### 2.2 Typography

| Element | Classes |
|---------|---------|
| Page title (h1) | `text-2xl font-bold text-gray-900` |
| Section heading (h2) | `text-xl font-semibold text-gray-900` |
| Card heading (h3) | `font-semibold text-gray-900` (or `font-medium`) |
| Hero title | `text-4xl font-bold text-gray-900` |
| Body text | `text-sm text-gray-600` |
| Label | `text-sm font-medium text-gray-700` |
| Hint/meta | `text-xs text-gray-500` |
| Link | `text-indigo-600 hover:text-indigo-500` |
| Error text | `text-sm text-red-600` |

### 2.3 Button Variants

| Variant | Classes | Usage |
|---------|---------|-------|
| **Primary** | `rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50` | Main action |
| **Primary wide** | `w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700` | Full-width forms |
| **Secondary / outline** | `rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50` | Secondary actions |
| **Ghost / link** | `text-sm text-indigo-600 hover:underline` | Tertiary, cancel |
| **Danger outline** | `rounded-md px-3 py-1 text-sm text-red-600 hover:bg-red-50` | Delete |
| **Pill toggle** | `rounded-full px-3 py-1 text-xs font-medium` + active: `bg-indigo-600 text-white` / inactive: `border border-gray-300 bg-white text-gray-600` | Tone selector |
| **Disabled state** | `disabled:cursor-not-allowed disabled:opacity-50` | Applied to all disabled buttons |

### 2.4 Input Styles

Standard input/select/textarea (all text-sm, all pages):
```
rounded-md border border-gray-300 px-3 py-2 shadow-sm
focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
```

### 2.5 Card/Panel Styles

| Style | Classes |
|-------|---------|
| Default card | `rounded-lg border border-gray-200 bg-white p-6 shadow-sm` |
| Hover card | `transition hover:shadow-md` |
| Error banner | `rounded-md bg-red-50 p-3 text-sm text-red-600` |
| Success banner | `rounded-md bg-green-50 p-3 text-sm text-green-700` |
| Info banner (indigo) | `rounded-lg border border-indigo-200 bg-indigo-50 p-4` |

### 2.6 Badge Styles

| Type | Classes |
|------|---------|
| Green (matched / high score) | `bg-green-100 text-green-700` |
| Yellow (medium score) | `bg-yellow-100 text-yellow-700` |
| Red (missing / low score) | `bg-red-100 text-red-700` |
| Indigo (feature tag) | `bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-xs font-medium` |
| Teal (feature tag) | `bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-xs font-medium` |

### 2.7 Status / Score Colors

- **Score/Match ≥ 80** → green (`#16a34a` / `green-600`)
- **Score/Match 60–79** → yellow (`#ca8a04` / `yellow-600`)
- **Score/Match < 60** → red (`#dc2626` / `red-600`)

### 2.8 Spinner / Loading

```html
<div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
```

Small inline spinner (in buttons):
```html
<svg class="h-4 w-4 animate-spin" ...>
```

---

## 3. Navigation & Routing

### 3.1 Route Table

| Path | Component | Protected | Notes |
|------|-----------|-----------|-------|
| `/` | `HomePage` | No | Public landing |
| `/login` | `LoginPage` | No | Supports `?verified=true` and `?reset=true` query params |
| `/register` | `RegisterPage` | No | |
| `/verify-email` | `VerifyEmailPage` | No | Requires `?token=<hex>` |
| `/forgot-password` | `ForgotPasswordPage` | No | |
| `/reset-password` | `ResetPasswordPage` | No | Requires `?token=<hex>` |
| `/dashboard` | `DashboardPage` | **Yes** | |
| `/upload` | `ResumeUploadPage` | **Yes** | |
| `/build` | `ResumeBuilderPage` | **Yes** | New resume |
| `/build/:id` | `ResumeBuilderPage` | **Yes** | Load existing draft |
| `/resume/:id` | `ResumeAnalysisPage` | **Yes** | |
| `/cover-letter/new` | `CoverLetterPage` | **Yes** | Standalone cover letter (not `/resume/:id/cover-letter`) |
| `*` | `NotFoundPage` | No | 404 |

**ProtectedRoute behavior:** If `user === null`, redirect to `/login`.

### 3.2 Global Header

Sticky top bar. `bg-white shadow-sm`. Height: `h-16`. Max-width: `max-w-7xl` centered.

**Logo:** `AI Resume Builder` — `text-xl font-bold text-indigo-600`, links to `/`.

**Nav (right side):**

| State | Nav items |
|-------|-----------|
| **Logged out** | "Login" (text link) + "Sign Up" (primary pill button `bg-indigo-600`) |
| **Logged in** | "Dashboard" (text link) + avatar circle (initials from first char of `user.name \|\| user.email`, `h-8 w-8 rounded-full bg-indigo-100 text-indigo-700`, `title={user.email}` tooltip) + "Logout" (`bg-gray-100 px-3 py-1.5 rounded-md`) |

### 3.3 Toast Notifications

Fixed position: `fixed right-4 top-4 z-50 flex flex-col gap-2`. Stacked vertically. Each toast has a close button. Types: `success` (default), `error`.

---

## 4. Authentication Flow

```
Register → "Check Email" screen (no auto-login)
    ↓ (email link)
/verify-email?token=... → success → "Sign In" button → /login?verified=true
    ↓
/login → credentials → /dashboard

Forgot password:
/forgot-password → email input → "Check email" screen
    ↓ (email link)
/reset-password?token=... → new password → /login?reset=true
```

**Key rules:**
- Registration does **not** auto-login. User must verify email first.
- Login returns HTTP 403 with `{ email, error }` if email unverified → show "Resend verification email" link.
- After email verify, if `autoLogin=true` in response → auto-redirect to `/dashboard` after 1.5s (legacy path).
- Session is cookie-based (`withCredentials: true` on all API calls).
- On any 401 response → axios interceptor redirects to `/login`.

---

## 5. Page-by-Page Layouts

---

### 5.1 Home Page (`/`)

**Layout:** Full-width single column, `flex flex-col`, no max-width container on hero.

#### Hero Section
- Min height: `min-h-[55vh]`
- Centered content: `flex flex-col items-center justify-center text-center px-4`
- `h1`: "Build Your Perfect Resume" — `text-4xl font-bold text-gray-900`
- `p`: subheadline about AI-powered resume builder — `text-lg text-gray-600 max-w-xl mb-8`

**CTAs (conditional):**

| User state | Buttons shown |
|------------|--------------|
| **Logged out** | "Get Started" (primary `bg-indigo-600`) linking to `/register` + "Login" (outline `border-gray-300`) linking to `/login` |
| **Logged in** | "Go to Dashboard" (primary `bg-indigo-600`) linking to `/dashboard` |

Buttons in a `flex gap-4` row.

#### Feature Showcase Section
- Background: `bg-gray-50 px-4 py-16`
- Container: `mx-auto max-w-4xl`
- Section title: `text-2xl font-bold text-gray-900 text-center mb-10`
- Grid: `grid grid-cols-1 gap-6 sm:grid-cols-3`

**3 Feature Cards** (equal-width, `rounded-xl border border-gray-200 bg-white p-6`):

| Card | Icon | Title | Description |
|------|------|-------|-------------|
| 1 | 📄 (3xl) | AI Resume Analysis | Upload PDF → ATS score + match % + suggestions |
| 2 | ✨ (3xl) | Resume Builder | Answer questions → AI generates ATS-optimized resume |
| 3 | ✉️ (3xl) | Cover Letter Generator | Paste JD → personalized keyword-rich cover letter |

No CTAs on individual cards.

---

### 5.2 Login Page (`/login`)

**Layout:** Centered card. `flex min-h-[calc(100vh-4rem)] items-center justify-center px-4`. Card: `w-full max-w-md`.

**Success banners (conditional, shown above form):**
- `?verified=true` → green banner: "Email verified successfully. You can now sign in."
- `?reset=true` → green banner: "Password reset successfully. Sign in with your new password."

**Error banner:** Red banner with error message. If 403 "email unverified" error, additionally shows inline link "Resend verification email" (clicking calls `POST /auth/resend-verification`). States: idle → "Sending..." → "Verification link sent".

**Form fields:**
1. Email (`type="email"`, required)
2. Password (`type="password"`, required) — label row has "Forgot password?" link to `/forgot-password` on the right

**Buttons (priority order):**
1. [PRIMARY] "Sign In" — `w-full bg-indigo-600`, disabled + "Signing in..." during loading
2. [LINK] "Sign up" — below form, links to `/register`

**Post-login:** Redirects to `/dashboard`.

---

### 5.3 Register Page (`/register`)

**Layout:** Same centered card as Login. `w-full max-w-md`.

**Two states:**

**State 1: Registration form**

Fields:
1. Name (optional, `text`)
2. Email (required, `type="email"`)
3. Password (required, `type="password"`, min 8 chars)
4. Confirm Password (required, `type="password"`)

Client-side validation (before API call):
- Passwords match check → "Passwords do not match"
- Password length ≥ 8 → "Password must be at least 8 characters"

**Buttons:**
1. [PRIMARY] "Sign Up" / "Creating account..." (loading) — `w-full bg-indigo-600`
2. [LINK] "Sign in" — below form, links to `/login`

**State 2: "Check your email" confirmation** (shown after successful registration)
- Large indigo envelope icon in `bg-indigo-100` circle
- "Check your email" heading
- Message: "We sent a verification link to **{email}**…"
- [LINK] "Didn't receive it? Resend" — calls resend API. States: idle → "Sending..." → "Verification link resent"
- [LINK] "Back to Sign In" → `/login`

No auto-login. User must click email link.

---

### 5.4 Verify Email Page (`/verify-email`)

**Layout:** Centered card. `w-full max-w-md text-center`.

Reads `?token=` from URL. Calls API on mount (deduplicated with `useRef`).

**Three states:**

| State | Visual |
|-------|--------|
| **loading** | Spinner + "Verifying your email..." |
| **success** | Green circle with checkmark icon. "Email Verified" heading. API message. If `autoLogin`: "Redirecting to dashboard..." else [PRIMARY] "Sign In" → `/login?verified=true` |
| **error** | Red circle with X icon. "Verification Failed" heading. Error message. Below: "Need a new verification link?" form with email input + "Resend" button |

---

### 5.5 Forgot Password Page (`/forgot-password`)

**Layout:** Centered card. `w-full max-w-md`.

**Two states:**

**State 1: Email input form**
- "Forgot your password?" heading
- Email input
- [PRIMARY] "Send Reset Link" / "Sending..." button

**State 2: Sent confirmation** (shown after submit, regardless of whether email exists)
- "Check your email" heading
- "If an account exists for {email}, we sent a reset link."
- [LINK] "Back to sign in" → `/login`

Rate limited on server (5 requests/hr per email).

---

### 5.6 Reset Password Page (`/reset-password`)

**Layout:** Centered card. `w-full max-w-md`.

Reads `?token=` from URL.

**Fields:**
1. New Password (`type="password"`, min 8 chars)
2. Confirm Password (`type="password"`)

**Buttons:**
1. [PRIMARY] "Reset Password" → calls API, on success redirects to `/login?reset=true`

Shows error banner if token invalid/expired.

---

### 5.7 Dashboard Page (`/dashboard`)

**Layout:** `mx-auto max-w-4xl px-4 py-12`.

**Header:**
- `h1`: "Welcome, {username}" — username extracted as `user.name || user.email.split('@')[0]`
- Subtitle: "Build a polished resume or write a cover letter — then optionally run an AI analysis on any existing PDF."

#### Section 1: Action Cards (above the fold)

**Two primary action cards** in a `grid gap-4 sm:grid-cols-2`:

**Card A — "Build from Scratch"** (`border-indigo-100 shadow-md`)
- Gradient header band: `bg-gradient-to-br from-indigo-500 to-violet-600` — contains pencil/edit icon + "Build from Scratch" title
- White body: description text + feature tags ("AI-generated content", "7 templates", "Live preview" as indigo pills)
- [PRIMARY] "Start Building →" (`w-full bg-indigo-600`) → `/build`

**Card B — "Generate Cover Letter"** (`border-teal-100 shadow-md`)
- Gradient header band: `bg-gradient-to-br from-teal-500 to-emerald-600` — envelope icon + "Generate Cover Letter" title
- White body: description text + feature tags ("Tone control", "ATS keywords", "PDF export" as teal pills)
- [PRIMARY] "Write Cover Letter →" (`w-full bg-teal-600`) → `/cover-letter/new`

**Divider row:** `flex items-center gap-4` — horizontal lines with "or analyze your existing resume" text badge in the middle.

**Secondary banner — "Upload & Analyze Existing Resume"** (`border-gray-200 bg-gray-50`, full-width row):
- Left: upload icon + title + description
- Right: [SECONDARY] "Upload PDF" (`border-gray-300 bg-white text-gray-700`) → `/upload`

#### Section 2: Resumes + Cover Letters (side by side on lg)

`grid grid-cols-1 gap-6 lg:grid-cols-2`. Both columns have a scrollable list capped at `max-h-[440px] overflow-y-auto`.

**Left column — "Your Resumes"**

Loading state: Pulse skeleton (2 gray bars).
Error state: Red error message.
Empty state: "No resumes yet. Upload one or build from scratch to get started."

Resume list items (`rounded-lg border border-gray-200 p-4 shadow-sm`):
- Entire row is a `<Link>` (except delete button) — destination depends on type: `has_file === true` → `/resume/{id}` (Path A); `has_file === false` → `/build/{id}` (Path B draft)
- Shows: `target_role` (or "Untitled Resume"), formatted `created_at` date
- If `match_percentage` is not null: shows match % in `text-indigo-600 font-bold` + "Match" label
- If `ats_score` is not null: shows ATS score in `text-green-600 font-bold` + "ATS" label
- [DANGER] "Delete" button (`text-red-600 hover:bg-red-50`) — triggers `window.confirm` dialog, then `DELETE /resume/:id` API call

**Right column — "Your Cover Letters"**

Header row: "Your Cover Letters" heading + [PRIMARY small] "+ New Cover Letter" (`bg-indigo-600`) → `/cover-letter/new`

Empty state: "No cover letters yet."

Cover letter items (each is a `<Link to="/cover-letter/new?resumeId={cl.resume_id}">`):
- Shows: `company_name` (or "Untitled Company"), `target_role` (or "—"), formatted `updated_at` date

---

### 5.8 Resume Upload Page (`/upload`)

**Layout:** `mx-auto max-w-2xl px-4 py-8`.

**Page title:** "Upload Your Resume" — `text-2xl font-bold text-gray-900`.

Two-step layout with numbered section headings:

#### Step 1: "Select your resume"
**FileUpload component:**
- Drag-and-drop zone: `border-2 border-dashed border-gray-300 rounded-lg p-8 text-center`
- Active drag: border turns indigo
- Accepts: PDF only, max 5MB (client-side validation)
- When file selected: shows filename + file size + "Remove" button
- Error if non-PDF or too large shown below the drop zone

#### Step 2: "Target position details"
**TargetRoleForm component:**
- Target Role (text, required)
- Target Country (text, required)
- Target City (text, optional)
- Job Description (collapsible textarea, optional, max 5000 chars) — toggle link "+ Add job description for better accuracy" / "− Hide job description"
- [PRIMARY] "Analyze Resume" → triggers upload

#### Progress states (shown after submit):
`UploadProgress` component below the form shows a multi-phase progress indicator:

| Status | Message shown |
|--------|--------------|
| `uploading` | "Uploading your resume..." |
| `parsing` | "Parsing your resume..." |
| `analyzing` | "Running AI analysis..." |
| `success` | "Analysis complete! Redirecting..." |
| `error` | Red error panel with error message |

While `isInProgress` (uploading/parsing/analyzing): [SECONDARY] "Cancel" button shown below progress. Clicking aborts the `AbortController` signal and resets state.

On success: auto-navigate to `/resume/{id}` after 500ms.

---

### 5.9 Resume Builder Page (`/build`, `/build/:id`)

**Layout:** Full-width, `min-h-screen bg-gray-50`. Three distinct zones: page header, mobile tab switcher, two-panel body.

#### Page Header (sticky at top, `border-b bg-white shadow-sm`)
- Left: "Build Your Resume" h1 + subtitle "Fill in your information and see your resume update in real-time"
- Right: **Save Draft** button (state-driven):
  - `idle`: "Save Draft" (`bg-gray-200 text-gray-700`)
  - `saving`: spinner + "Saving..." (disabled)
  - `saved`: checkmark icon + "Saved" (`bg-green-100 text-green-700`)
  - `error`: warning icon + "Save Failed" (`bg-red-100 text-red-700`)

#### Mobile Tab Switcher (visible below `lg:hidden`, sticky)
Two full-width tabs: "Edit" | "Preview". Active tab: `bg-indigo-600 text-white`. Inactive: `bg-gray-100 text-gray-700`.

#### Two-Panel Body (`lg:grid lg:grid-cols-[minmax(400px,35%)_1fr] lg:gap-6`)

**Left Panel — Form (35%)**

- `StepIndicator` (see §7 for step details)
- White form card `rounded-lg border border-gray-200 bg-white p-6 shadow-sm`
  - If step validation errors: red error box at top listing each error as a bullet
  - Current step component (only visible step rendered)
  - Navigation buttons row (bottom of card):
    - Left: [SECONDARY] "Back" (hidden on step 0, renders an empty `<div>` as placeholder)
    - Right: if `isLastStep` → [PRIMARY `bg-indigo-600`] "Finish & Preview" / "Saving..." (disabled during submit). If not last step → [PRIMARY `bg-indigo-600`] "Next"
- `UploadProgress` component shown below card when `status` is not null

**Right Panel — Live Preview (65%)**

`sticky top-6 h-[calc(100vh-8rem)] overflow-hidden rounded-lg`

`ResumePreview` component:
- **Toolbar** (top of preview panel):
  - "Choose Template" button (opens template switcher)
  - Zoom controls: "−" / "{N}%" / "+" / "Fit" buttons
- **Preview area**: scaled canvas showing the live resume template (debounced 300ms from form changes)

**Template Switcher Modal** (full-screen overlay, `fixed inset-0 bg-white z-50 overflow-y-auto`):
- Grid of template cards (see §8)
- "Close" / "X" button
- Each card: template name, description, thumbnail visual representation, "Select" button
- Locked (premium) templates shown with lock badge

**Submission flow:**
1. Click "Finish & Preview" → validates all required steps client-side
2. If invalid: `status = 'error'`, error shown in UploadProgress
3. If valid: `status = 'analyzing'` → `POST /resume/build` → on success: toast + navigate to `/resume/{id}` after 1.5s

**Draft loading (when `/build/:id`):**
- Full-screen spinner shown: "Loading draft..."
- On load: form pre-populated, completed steps pre-marked, toast "Draft loaded successfully"
- On error: toast + navigate to `/build`

**Unsaved changes warning:** `beforeunload` event listener prevents page leave if `hasUnsavedChanges === true`.

**Skills auto-generation:** When navigating to Step 4 (Skills), if `targetRole` and `targetIndustry` are set, auto-calls `POST /ai/generate-skills`. On success: up to 15 skill suggestions shown. Shows loading skeleton while generating, error message if fails, "Regenerate" button.

---

### 5.10 Resume Analysis Page (`/resume/:id`)

**Layout:** `mx-auto max-w-4xl px-4 py-8`. Single column, `space-y-6`.

#### Page Header Row
- Left: "Resume Analysis" h1 + `target_role` subtitle + optional "Analyzed against job description" green badge
- Right buttons (left to right):
  1. [PRIMARY] "✨ Generate Cover Letter" (`bg-indigo-600`) → `/cover-letter/new`
  2. [SECONDARY] "Re-analyze" (`border-indigo-300 text-indigo-600`) — toggles re-analyze panel
  3. [LINK] "Back to Dashboard"

#### Original PDF Viewer (Path A only — visible when `hasFile === true`)
- [SECONDARY] "View Original Resume ↓" / "Hide Original Resume ↑" toggle button
- Expanding `<iframe src="/api/resume/{id}/file" height="800px">` — uses native browser PDF rendering

#### Re-analyze Panel (collapsible, shown when "Re-analyze" clicked)
Background: `bg-indigo-50 border-indigo-200`. Fields:
1. "Target Role" text input (required to submit)
2. Toggle link "+ Add job description for better accuracy" / "− Hide job description" → reveals textarea (max 5000 chars) with character counter
3. [PRIMARY] "Run Analysis" (`bg-indigo-600`, disabled when loading or role empty) / "Analyzing…"
4. [LINK] "Cancel" → collapses panel

On success: updates all score cards, clears ATS/improvements, refreshes history panel, shows "Re-analysis complete" toast.

#### Analysis Cards (in `space-y-6`):

**1. MatchScoreCard**
- Large donut/circle showing `matchPercentage%` — color coded green/yellow/red
- Three sections: Strengths ✓ (green pills), Weaknesses ✗ (red pills), Suggestions (numbered list)

**2. AtsScoreCard**
- SVG donut chart (128×128 viewBox, r=54, cx=cy=64) — color: green ≥80, yellow ≥60, red <60
- Center text: `{totalScore}` + `/100`
- Three sub-score rows: Format Compliance, Keyword Match, Section Completeness (each with badge label)
- If `atsBreakdown === null`: shows [SECONDARY] "Calculate ATS Score" button → calls API
- Keyword coverage: "Matched" (green badges) + "Missing" (red badges)

**3. ImprovementSuggestions**
- "Quick Suggestions" list (from match analysis)
- Expandable "Detailed Analysis" section:
  - If `detailed === null`: [SECONDARY] "Analyze Improvements" button
  - If loading: spinner
  - If loaded: Action Verbs table, Quantified Achievements list, Missing Sections, Keyword Optimization, Formatting Issues

**4. Analysis History Panel** (only shown when `history.length > 1`)
- `rounded-lg border border-gray-200 bg-white p-6`
- "Analysis History" heading
- Each entry: clickable row (`rounded-md border px-4 py-3 text-left`)
  - Active entry: `border-indigo-300 bg-indigo-50`
  - Shows: target role, match % badge (color-coded), date, JD preview (truncated to 80 chars)
  - Clicking: restores match data, resets ATS/improvements to null

**5. ExportButtons**
- [SECONDARY] "Export PDF" — renders template to HTML client-side then POSTs to server
- [SECONDARY] "Export Markdown" — direct download

**Loading state (initial fetch):** Pulse skeleton (gray placeholder bars).
**Error state (initial fetch, no data):** Red error text + "Back to Dashboard" link.

---

### 5.11 Cover Letter Page (`/cover-letter/new`)

**Query param:** Accepts `?resumeId={uuid}` — when present, the page enters **attached mode**: the resume selector is pre-selected and locked to that resume, and the cover letter for that resume is fetched on mount. Without `?resumeId`, the page is in **standalone mode** and the user must pick a resume from the dropdown.

**Layout:** `flex h-screen flex-col` — full viewport height split panel. No inner scrolling of the page itself.

#### Left Panel — Controls (`w-96 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-6`)

Top: `← Back to Dashboard` (indigo link)
Heading: "Cover Letter Generator" (`text-xl font-bold`)

**Form fields (top to bottom):**

| # | Field | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | Select Resume | `<select>` | Yes | Options: "— choose a resume —" + user's resumes (label: `{target_role} — {target_country}`) |
| 2 | Full Name | text | No | Pre-filled from `user.name` |
| 3 | Target Role | text | No | |
| 4 | Target Location | text | No | e.g. "London, UK" |
| 5 | Job Description | textarea (5 rows, max 5000) | **Yes** | Character counter below |
| 6 | Company Name | text | **Yes** | |
| 7 | Hiring Manager | text | No | "(optional)" in placeholder |
| 8 | Tone | Pill toggle buttons | No | Professional / Enthusiastic / Formal / Conversational. Default: Professional |
| 9 | Length | Radio buttons | No | Short (~150w) / Medium (~250w, default) / Long (~400w) |
| 10 | Custom Instructions | textarea (3 rows, max 500) | No | Character counter, turns red when over limit |

**Generate button** (full width, bottom of left panel):
- [PRIMARY] "Generate Cover Letter" / "↺ Regenerate" (if cover letter exists) / "Generating..." (during generation)
- Disabled when: no resume selected, no job description, no company name, over custom instructions limit, or generating
- If cover letter already exists and user clicks generate: shows **Confirmation Dialog** (modal overlay):
  - "Regenerate cover letter?" heading
  - [SECONDARY] "Cancel" + [PRIMARY] "Regenerate"

#### Right Panel — Output (`flex-1 bg-gray-50 overflow-hidden`)

**Four mutually exclusive states:**

**1. Loading:** Centered spinner (fetching existing cover letter on mount).

**2. Empty state:** Centered ✉️ emoji + "Your cover letter will appear here" + "Fill in the fields and click Generate".

**3. Progress state** (during generation, `isGenerating === true`):
Centered container `max-w-sm space-y-6`:
Three `ProgressStepRow` items (each: circular indicator + label):

| Step | Label | Status icons |
|------|-------|-------------|
| 1 | "Scanning resume and job description" | pending: gray dot / active: indigo spinner / done: green checkmark |
| 2 | "Analyzing keyword matches" | (same) — when `keywords-ready`: shows keyword badge preview below (green ✓ for matched, red ✗ for missing, up to 8 each) |
| 3 | "Writing your ATS-optimized cover letter" | (same) |

**4. Error state:** Centered red card with error message + [DANGER] "Try again" button (calls `reset()`).

**5. Letter ready** (when `showLetter === true`):
`flex flex-col overflow-hidden p-6`:
- Top bar: company name (bold) + role (gray) + today's date
- **Editable textarea** (`flex-1 resize-none font-mono text-sm leading-relaxed`) — full editable cover letter text
- Word count below textarea: color-coded (`green-600` if 200–450 words, `yellow-600` if 150–200 or 450–550, `red-600` otherwise)
- "Revert to AI original" link (shown only when edited content ≠ `generated_content`)
- **ATS Keyword Coverage section** (shown when keywords exist):
  - Section label: "ATS Keyword Coverage" (uppercase tracking-wide)
  - Badges: green with ✅ if keyword found in letter, red with ❌ if not
- **Action bar** (bottom, `border-t border-gray-200 pt-4`):
  1. [PRIMARY] "Save Changes" (`bg-indigo-600`) / "Saving..." / "Saved ✓" (green text inside button)
  2. [SECONDARY] "Download PDF" → Puppeteer PDF export
  3. [SECONDARY] "Download .txt" → browser blob download

---

## 6. Shared Components

### 6.1 Header
See §3.2. File: `src/components/shared/Header.tsx`.

### 6.2 Toast
`src/components/shared/Toast.tsx`. Shown in stack at `fixed right-4 top-4`. Each toast: rounded card with message + close button. Success: green accent, Error: red accent. Auto-dismiss (managed by `useToast` hook).

### 6.3 ProtectedRoute
`src/components/shared/ProtectedRoute.tsx`. Wraps children. If `user === null`, renders redirect to `/login`. No loading flicker (App-level auth check runs first).

### 6.4 StepIndicator
`src/components/resume-builder/StepIndicator.tsx`.

Horizontal step list. Each step:
- Number circle (or checkmark if completed)
- Step label below
- Connector line between steps

States:
- `current`: indigo filled circle, label bold
- `completed`: green checkmark circle, label normal
- `future`: gray circle, label muted
- Clickable to jump to any step (calls `onStepClick`)

### 6.5 UploadProgress
`src/components/resume-upload/UploadProgress.tsx`.

Renders based on `status: UploadStatus`:

| Status | Visual |
|--------|--------|
| `uploading` | Blue progress bar step 1/3 + message |
| `parsing` | Blue progress bar step 2/3 + message |
| `analyzing` | Blue progress bar step 3/3 + AI spinner + message |
| `success` | Green success banner + checkmark |
| `error` | Red error banner + error message |

### 6.6 FileUpload
`src/components/resume-upload/FileUpload.tsx`.

Drag-and-drop + click-to-select. Accepts PDF only (max 5MB). Shows file name + size when selected. "Remove" button. Error shown by parent.

### 6.7 TargetRoleForm
`src/components/resume-upload/TargetRoleForm.tsx`.

Fields: Target Role, Target Country, Target City (optional), Job Description (collapsible). Submit button: "Analyze Resume". Disabled during `loading`.

### 6.8 ResumePreview
`src/components/live-preview/ResumePreview.tsx`.

Container width: `width: '8.5in'` with `maxWidth: '100%'`. Renders `ResumeTemplateSwitcher` with debounced data. Contains zoom controls toolbar and "Choose Template" button.

### 6.9 TemplateSwitcher
`src/components/templates/TemplateSwitcher.tsx`.

Full-screen modal shown in builder. Grid of `TemplateCard` components. Close button top-right.

### 6.10 TemplateCard
`src/components/templates/TemplateCard.tsx`.

Shows: template name, description, visual thumbnail (mini SVG or colored preview), "Select" button, lock badge if `isLocked`.

---

## 7. Multi-Step Form Builder — Steps Detail

The form has **6 steps** with these `STEP_LABELS`:

```
0: Personal Info  |  1: Education  |  2: Experience  |  3: Skills  |  4: Summary  |  5: Additional
```

### Validation Rules

| Step | Required fields | Optional |
|------|----------------|----------|
| 0: Personal Info | fullName, email, phone, city, country, targetRole, targetIndustry, targetCountry | linkedinUrl, portfolioUrl, additionalLinks, profilePhoto, targetCity |
| 1: Education | At least 1 entry; degreeType, major, university, graduationDate required | gpa, relevantCoursework, honors |
| 2: Experience | None (fully optional) | All fields |
| 3: Skills | None (fully optional) | All fields |
| 4: Summary | professionalSummary (min 100 chars) | — |
| 5: Additional | None (fully optional) | certifications, extracurriculars |

Validation runs on "Next" click. Errors shown in red box at top of form card. Navigation blocked until fixed.

### Step 0: Personal Info

**Personal details section:**
- Full Name*, Email*, Phone*, City*, Country*
- LinkedIn URL (optional)
- Portfolio URL (optional)
- Additional Links: up to 3 custom links. Each has: Label dropdown ("GitHub" / "Behance" / "Medium" / "Dribbble" / "YouTube" / "Custom") + URL. "Custom" shows a free-text label field. "+ Add Link" button (hidden when 3 links added).

**Profile Photo** (shown only when `SUPPORTS_PHOTO[selectedTemplate] === true`):
- Click to upload image (`image/*`, max 2MB)
- Converted to base64 DataURL stored in `formData.profilePhoto`
- Preview thumbnail shown after upload. "Remove" button.

**Target Position section:**
- Target Role*
- Target Industry* (free text)
- Target Country*
- Target City (optional)

### Step 1: Education

- At least 1 education entry (first is required)
- Each entry fields: Degree Type*, Major/Field of Study*, University*, Graduation Date*, GPA (optional), Relevant Coursework, Honors (optional)
- "+ Add Education" button adds another entry
- "Remove" button on each entry (except when only 1 remains)

### Step 2: Experience

- Zero or more experience entries
- Each entry: Type (dropdown: internship/part-time/full-time/freelance/volunteer)*, Company*, Role*, Duration*, Responsibilities* (textarea), Industry (optional)
- "+ Add Experience" button
- "Remove" button on each entry

### Step 3: Skills

**AI generation panel** (shown automatically on step entry):
- If generating: spinner + "Generating skills suggestions..."
- If error: error message + "Retry" button
- If suggestions loaded: up to 15 skill chips displayed. Clicking adds to technical skills.

**Technical Skills:** Categorized entries. Each category: category name text + items array (comma-separated chips). "+ Add Category" button.

**Soft Skills:** Grid of toggle chips for common soft skills (hardcoded list). Clicking toggles on/off. Also free-text input for custom soft skills.

**Languages:** Entries with language name + proficiency dropdown (native/fluent/professional/intermediate/basic). "+ Add Language".

### Step 4: Professional Summary

- Large textarea
- Min 100 chars (validated)
- Character count shown
- [SECONDARY] "AI Generate Summary" button — calls AI endpoint to generate from form data

### Step 5: Additional (Optional)

- Certifications (textarea, optional)
- Extracurriculars / Achievements (textarea, optional)

---

## 8. Template System

### 8.1 The 6 Active Templates

| TemplateId | Display Name | Layout | Accent Color | Photo Support |
|------------|-------------|--------|-------------|---------------|
| `modern_yellow_split` | Modern Yellow Split | 2-column, yellow accent sidebar | Yellow | Yes |
| `dark_ribbon_modern` | Dark Ribbon Modern | 2-column, dark charcoal sidebar | Charcoal `#2b2b2b`, ribbon section headers | Yes |
| `modern_minimalist_block` | Modern Minimalist Block | 2-column, dark sidebar | Charcoal `#454545`, dark block headers `#3b3434` | Yes |
| `editorial_earth_tone` | Editorial Earth Tone | 2-column, vertical dark pill sidebar accent | Earth tones `#483930`, beige `#EFEBE3` bg | Yes |
| `ats_clean` | ATS Clean | Single-column, no sidebar | White `#ffffff`, text `#222222` | **No** |
| `ats_lined` | ATS Lined | Single-column, no sidebar | Navy accent `#1a3557`, border-bottom h2 | **No** |

**Photo support:** Only the 4 modern templates (`modern_yellow_split`, `dark_ribbon_modern`, `modern_minimalist_block`, `editorial_earth_tone`) support profile photos. ATS templates (`ats_clean`, `ats_lined`) do not — photo upload input in Step 0 is hidden when `SUPPORTS_PHOTO[selectedTemplate] === false`.

### 8.2 Template Switcher UI

Opened via "Choose Template" button in the live preview toolbar. Full-screen white overlay.

**Category filter tabs** (3 tabs, rendered above the grid):
- **All** — shows all 6 templates
- **Modern** — shows the 4 modern templates
- **ATS** — shows the 2 ATS-friendly templates (`ats_clean`, `ats_lined`)

Active tab: `bg-indigo-600 text-white rounded-full`. Inactive: `border border-gray-300 bg-white text-gray-600 rounded-full`.

Grid of template cards. Each card:
- Template name + description
- Visual thumbnail / color swatch
- [PRIMARY] "Select" / "Selected" (if currently active)
- Lock icon badge if premium (`requiredTier > 'free'`)

On selection: updates `selectedTemplate` state + saves to `localStorage('resumeBuilder_selectedTemplate')`. Preview re-renders immediately.

### 8.3 Template Persistence

Selected template saved in `localStorage`. Restored on page load. Validated against `VALID_TEMPLATE_IDS` list.

### 8.4 Template-Aware PDF Export

Client renders the selected React template to HTML string using `createRoot` + `flushSync` into a detached `8.5in`-wide div. HTML string POSTed to `POST /export/pdf-from-html`. Templates use inline styles only (no Tailwind in Puppeteer context).

---

## 9. Interaction Patterns

### 9.1 Debounced Live Preview
Form data changes in the builder → 300ms debounce before `debouncedFormData` updates → `ResumePreview` re-renders with new data. Prevents lag on every keystroke.

### 9.2 Unsaved Changes Warning
`ResumeBuilderPage` attaches a `beforeunload` listener while `hasUnsavedChanges === true`. Browser shows native "Leave page?" dialog. Cleared after successful save or submit.

### 9.3 Upload Cancellation (AbortController)
In `ResumeUploadPage`, an `AbortController` is created per upload. "Cancel" button calls `controller.abort()`. All scheduled `setTimeout` phase transitions are also cleared. On abort, status resets to null (no error shown).

### 9.4 Toast Notifications
All user-facing operations trigger toasts via `useToastContext`:
- Success: "Resume uploaded and analyzed successfully", "Draft saved", "Resume deleted", etc.
- Error: API error message from `err.response.data.error` or generic fallback

### 9.5 AI Generation Feedback
- Skills generation: loading spinner with "Generating…" overlay inside skills step
- Cover letter generation: 3-step progress row (see §5.11)
- Resume submission: UploadProgress component with multi-phase visual
- All AI operations disabled when in progress (button disabled)

### 9.6 Auto-Save Draft
Manual "Save Draft" button (not auto-save). Debounced save is NOT triggered automatically — user must click. First save creates a new resume record and stores the `resumeId` in state for subsequent saves.

### 9.7 Confirmation Dialogs
- **Delete resume:** `window.confirm("Are you sure you want to delete this resume?")`
- **Regenerate cover letter:** Custom modal dialog (not `window.confirm`)

### 9.8 Analysis History Navigation
Clicking a history entry in the analysis page is non-destructive (just restores UI state from the entry's stored data). ATS/detailed improvements are reset to null (must re-run those analyses).

### 9.9 PDF Viewer Toggle
On analysis page (Path A only), "View Original Resume ↓" expands an `<iframe>` below the button. Toggle collapses it. Uses native browser PDF rendering — no library.

---

## 10. API Surface (Frontend Calls)

All calls through `axios` instance with `baseURL: '/api'` and `withCredentials: true`. 401 responses trigger redirect to `/login`.

| Method | Path | Used on page | Purpose |
|--------|------|-------------|---------|
| POST | `/auth/register` | Register | Create account |
| POST | `/auth/login` | Login | Login |
| POST | `/auth/logout` | Header | Logout |
| GET | `/auth/me` | App mount | Check session |
| GET | `/auth/verify-email?token=` | VerifyEmail | Verify token |
| POST | `/auth/resend-verification` | Login, Register, VerifyEmail | Resend verify email |
| POST | `/auth/forgot-password` | ForgotPassword | Send reset email |
| POST | `/auth/reset-password` | ResetPassword | Set new password |
| GET | `/resume` | Dashboard | List resumes |
| GET | `/resume/:id` | Analysis | Get single resume |
| GET | `/resume/:id/file` | Analysis (Path A) | Stream original PDF |
| POST | `/resume/build` | Builder | Build + analyze resume |
| POST | `/resume/upload` | Upload | Upload PDF |
| DELETE | `/resume/:id` | Dashboard | Delete resume |
| POST | `/resume/draft/save` | Builder | Save draft |
| GET | `/resume/draft/:id` | Builder | Load draft |
| POST | `/resume/:id/switch-template` | TemplateSwitcher | Change template |
| GET | `/templates` | TemplateSwitcher, Analysis | List templates |
| GET | `/templates/:id` | — | Get template |
| POST | `/analysis/match` | Analysis | Match analysis |
| POST | `/analysis/ats-score` | Analysis | ATS score |
| POST | `/analysis/improve` | Analysis | Improvement suggestions |
| POST | `/analysis/reanalyze` | Analysis | Re-analyze with new role/JD |
| GET | `/analysis/history/:id` | Analysis | Analysis history |
| POST | `/export/pdf-from-html` | Analysis, CoverLetter | Generate PDF from HTML |
| GET | `/export/markdown/:id` | Analysis | Export Markdown |
| POST | `/cover-letter/generate` | CoverLetter | Generate cover letter |
| GET | `/cover-letter/:resumeId` | CoverLetter | Fetch existing letter |
| PUT | `/cover-letter/:resumeId` | CoverLetter | Save edits |
| DELETE | `/cover-letter/:resumeId` | CoverLetter | Delete letter |
| POST | `/cover-letter/extract-keywords` | CoverLetter | Pre-flight keyword extraction |
| GET | `/cover-letter` | Dashboard | List all cover letters |
| POST | `/ai/generate-skills` | Builder (Step 3) | AI skill suggestions |

---

## 11. Accessibility & Responsiveness

### 11.1 Responsive Breakpoints (Tailwind defaults)
- `sm`: 640px
- `lg`: 1024px

### 11.2 Mobile Adaptations

| Page | Mobile behavior |
|------|----------------|
| Resume Builder | Tab switcher (Edit / Preview) replaces side-by-side layout below `lg`. Active tab: `bg-indigo-600`. |
| Dashboard | Action cards stack to single column below `sm`. Resumes + Cover Letters stack below `lg`. |
| Home | Feature cards stack to single column below `sm`. |
| Cover Letter | Left panel is full-width on mobile (right panel scrolls behind it — fixed height layout may scroll). |

### 11.3 Keyboard Support
- All buttons have visible focus rings (`focus:ring-1 focus:ring-indigo-500`)
- Modal dialogs (template switcher, confirm dialog) trap focus
- Step indicator clickable via keyboard
- Form fields have associated `<label>` elements with `for`/`htmlFor`

### 11.4 Semantic HTML
- `<header>` for site navigation
- `<h1>` / `<h2>` / `<h3>` hierarchy maintained per page
- `<form>` with `onSubmit` for all submission forms
- `aria-label` on icon-only buttons (e.g., delete button: `aria-label="Delete {role}"`)
- `aria-hidden={true}` on non-visible step panels

### 11.5 Loading/Error States
Every data-fetch page has three states: loading skeleton → data → error. No blank screens.

### 11.6 Redirect Behavior Summary

| Situation | Redirect |
|-----------|----------|
| Unauthenticated access to protected route | → `/login` |
| 401 response from any API call | → `/login` |
| Successful login | → `/dashboard` |
| Successful resume upload | → `/resume/{id}` (500ms delay) |
| Successful resume build | → `/resume/{id}` (1500ms delay) |
| Successful password reset | → `/login?reset=true` |
| Email verification (no auto-login) | → `/login?verified=true` |
| Email verification (with auto-login) | → `/dashboard` (1500ms delay) |
| Draft load error | → `/build` |
