# Resume Builder — Frontend Handoff Specification

This document is a complete specification for rebuilding the Resume Builder feature from scratch. It preserves all existing functionality, layout decisions, validation rules, and API contracts. A new AI or developer should be able to implement a pixel-faithful, fully functional replacement using only this document.

---

## 1. Feature Overview

The Resume Builder is a multi-step form (6 steps) with a live resume preview side-by-side. Users fill in their information step by step, see an instant preview of their resume in a selected template, and submit to generate a finished resume.

**Two modes:**
- **New resume** — URL: `/build` — starts with blank form
- **Edit draft** — URL: `/build/:id` — loads existing draft from backend on mount

**Post-submit:**
- URL becomes `/build/:id` with `location.state.justCompleted = true`
- Shows a full-screen "completion view" (preview + action buttons)

---

## 2. Page Layout

### Desktop (lg breakpoint, ≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│  Left Column (38%, min 360px)  │  Right Column (flex-1) │
│                                │                        │
│  [Page Header]                 │  [Live Preview Panel]  │
│  [Step Indicator]              │                        │
│  [Form Card]                   │                        │
│    [Step Content]              │                        │
│    [Back] [Next/Submit]        │                        │
│  [UploadProgress (if active)]  │                        │
└─────────────────────────────────────────────────────────┘
```

- Left: `lg:w-[38%] lg:min-w-[360px] lg:shrink-0 lg:border-r lg:border-gray-200 lg:flex lg:flex-col lg:h-full`
- Right: `lg:flex-1 lg:h-full lg:overflow-hidden`
- Page root: `bg-gray-50 lg:h-[calc(100vh-4rem)] lg:flex lg:overflow-hidden`

### Mobile (< lg breakpoint)
- Single-column layout
- **Tab Switcher** (sticky, `z-20`) appears below the page header: "Edit" | "Preview" tabs
- Active tab: `bg-blue-600 text-white`
- Inactive tab: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Only the active panel is visible; the other has `hidden` class

### Left Panel scroll
- `lg:flex-1 lg:overflow-y-auto` — form area scrolls independently on desktop

---

## 3. Page Header (Left Column)

```
┌──────────────────────────────────────────────┐
│  Build Your Resume              [Save Draft] │
└──────────────────────────────────────────────┘
```

- Background: white, `border-b border-gray-200`, `shadow-sm`
- Padding: `px-4 py-4 lg:px-6`
- Title: `text-2xl font-bold text-gray-900` — "Build Your Resume"
- Save Draft button: described in section 9

---

## 4. Step Indicator

### Visual Structure
```
( 1 ) ──── ( 2 ) ──── ( 3 ) ──── ( 4 ) ──── ( 5 ) ──── ( 6 )
Pers.Info  Education  Experience  Skills    Summary  Additional
```

- Rendered as `<nav aria-label="Form progress">` with `<ol class="flex items-start">`
- Each step: circle + label stacked vertically, connected by horizontal line

### Step States

| State     | Circle style                                              | Label style            |
|-----------|-----------------------------------------------------------|------------------------|
| Upcoming  | `bg-white text-gray-400 ring-2 ring-gray-200`            | `text-gray-400`        |
| Current   | `bg-blue-600 text-white ring-[3px] ring-offset-2 ring-blue-500` | `text-blue-600 font-semibold` |
| Completed | `bg-blue-600 text-white` (shows checkmark SVG, not number) | `text-blue-500`       |

- Circle size: `h-8 w-8 rounded-full text-xs font-semibold`
- Completed circle shows a checkmark `<svg>` (path `M5 13l4 4L19 7`, strokeWidth 2.5) instead of number
- Completed + not current: hoverable — `group-hover:bg-blue-700 group-hover:scale-105`

### Connector Line
- `flex-1 mx-1 mt-4 h-0.5 rounded-full bg-gray-200 overflow-hidden`
- Inner fill: `h-full rounded-full bg-blue-600 transition-all duration-300`
- Width: `w-full` when step is completed, `w-0` otherwise

### Step Labels
- Font: `text-[10px] font-medium leading-tight text-center whitespace-nowrap`

### Click Behavior
- Completed steps (not current) are clickable — `onStepClick(index)` called
- Clicking clears `stepErrors`
- Current and upcoming steps are not clickable (`cursor-default`, `disabled`)

### Step Labels Array
```
['Personal Info', 'Education', 'Experience', 'Skills', 'Summary', 'Additional']
```
Index 0–5.

---

## 5. Form Card

Wraps the current step content + navigation buttons.

- Style: `rounded-lg border border-gray-200 bg-white p-6 shadow-sm`
- Applied `mt-6` below StepIndicator
- All 6 step components are mounted at once; display toggled via `style={{ display: currentStep === index ? '' : 'none' }}` and `aria-hidden`

### Navigation Buttons (bottom of card)
- Layout: `mt-6 flex justify-between`
- **Back** (steps 1–5 only): `rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50`
- **Next** (steps 0–4): `rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700`
- **Submit & Generate** (step 5 only): same style as Next but `disabled` when `status !== null && status !== 'error'`
  - Label changes to "Generating..." while `status === 'analyzing'`

---

## 6. Validation Error Banner

Shown inside the form card, above the step content, when `stepErrors.length > 0`.

```
┌─────────────────────────────────────────────────┐
│ [!] Please fix the following errors:           │
│     • Full Name is required                    │
│     • Email is required                        │
└─────────────────────────────────────────────────┘
```

- Container: `mb-6 rounded-lg bg-red-50 border border-red-200 p-4`
- Icon: red exclamation circle SVG, `h-5 w-5 text-red-400 mt-0.5`
- Heading: `text-sm font-medium text-red-800` — "Please fix the following N error(s):"
- List: `mt-2 text-sm text-red-700 list-disc list-inside space-y-1`
- On "Next" click: if validation fails, errors appear and page scrolls to top (`window.scrollTo({ top: 0, behavior: 'smooth' })`)

---

## 7. Form Steps (Detailed)

All step components receive `data: ResumeFormData` and `onChange: (data: ResumeFormData) => void`.

### Step 0 — Personal Info

**Section: Profile Photo** (only rendered when `showPhotoUpload` prop is `true`)
- `showPhotoUpload = SUPPORTS_PHOTO[selectedTemplate] ?? false`
- Templates with photo support: `modern_yellow_split`, `dark_ribbon_modern`, `modern_minimalist_block`, `editorial_earth_tone`
- ATS templates (`ats_clean`, `ats_lined`) do NOT support photos
- Photo preview: `h-20 w-20 rounded-full object-cover border-2 border-gray-200`
- No photo placeholder: `h-20 w-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 text-2xl text-gray-400`
- Upload button: `cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50`; hidden `<input type="file" accept="image/*">`
- File size limit: 2MB; `alert('Image must be under 2MB')` if exceeded
- Stored as base64 data URL in `formData.profilePhoto`
- Remove button: `absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600`, label "x"
- Accepted formats text: "JPG, PNG, WebP — max 2MB"

**Section: Contact Details** (2-column grid, `grid gap-4 sm:grid-cols-2`)

| Field        | Type   | Required | Placeholder |
|--------------|--------|----------|-------------|
| Full Name    | text   | Yes (*)  | —           |
| Email        | email  | Yes (*)  | —           |
| Phone        | tel    | Yes (*)  | —           |
| City         | text   | Yes (*)  | —           |
| Country      | text   | Yes (*)  | —           |

**Section: Target Position** (2-column grid)

| Field           | Type   | Required | Placeholder              |
|-----------------|--------|----------|--------------------------|
| Target Role     | text   | Yes (*)  | e.g., Junior Data Analyst |
| Target Industry | select | Yes (*)  | "Select industry"        |
| Target Country  | text   | Yes (*)  | e.g., United States      |
| Target City     | text   | No       | e.g., San Francisco      |

Target Industry options: `Technology, Marketing, Sales, Finance, HR, Design, Healthcare, Education, Engineering, Consulting, Retail, Hospitality, Other`

**Section: Professional Links** (2-column grid)

| Field              | Type | Required | Placeholder                          |
|--------------------|------|----------|--------------------------------------|
| LinkedIn Profile   | url  | No       | https://linkedin.com/in/yourname     |
| Portfolio/Website  | url  | No       | https://yourportfolio.com            |

**Additional Links** (max 3)
- Each link: `rounded-xl border border-blue-100 bg-blue-50/40 p-3`
- Label text: "Additional Link N" in `text-xs font-medium text-blue-700/70`
- Two inputs per link:
  - Label input: `w-36`, placeholder "e.g. GitHub", `maxLength={30}`
  - URL input: full width with link icon prefix (`absolute left-3 h-4 w-4 text-gray-400`), placeholder "https://..."
- Remove button: trash/X icon, `text-gray-400 hover:text-red-500`
- "Add Another Link" button: `inline-flex items-center gap-1.5 rounded-full border border-dashed border-blue-400 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50`
  - Hidden when 3 links already added

**Validation (step 0):**
All 5 required contact fields + targetRole + targetIndustry + targetCountry must be non-empty.

---

### Step 1 — Education

- Header: `text-lg font-semibold text-gray-900` — "Education"
- Each entry: `space-y-3 rounded-lg border border-gray-200 p-4`
- Entry header: "Education #N" + Remove button (red, only shown when >1 entry)
- Fields (2-column grid):

| Field              | Type        | Required | Placeholder              |
|--------------------|-------------|----------|--------------------------|
| Degree Type        | text        | Yes      | e.g. Bachelor of Science |
| Major/Field of Study | text      | Yes      | e.g. Computer Science    |
| University         | text        | Yes      | —                        |
| Graduation Date    | month       | Yes      | (date picker)            |
| GPA                | text        | No       | e.g. 3.8                 |
| Honors             | text        | No       | —                        |

- **Relevant Coursework**: `<RichTextEditor>` with `minHeight="72px"`, placeholder "e.g. Data Structures, Algorithms, Web Development"

- "Add Education" button: `rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700`

**Validation (step 1):**
- At least 1 entry required
- First entry must have degreeType, major, university, graduationDate

---

### Step 2 — Experience (optional)

- Header + subtext: "Add internships, part-time jobs, or volunteer work. This section is optional for fresh graduates."
- Empty state: `text-sm italic text-gray-500` — "No experience added yet."
- Each entry: same card style as Education
- Fields (2-column grid):

| Field              | Type   | Required | Options / Placeholder                       |
|--------------------|--------|----------|---------------------------------------------|
| Type               | select | Yes      | Internship, Part-time, Full-time, Freelance, Volunteer |
| Company/Organization | text | No       | —                                           |
| Industry           | text   | No       | e.g., Technology, Finance                   |
| Role               | text   | No       | —                                           |
| Duration           | text   | No       | e.g. Jun 2023 - Aug 2023                    |

- **Key Responsibilities**: `<RichTextEditor>` with `minHeight="100px"`, placeholder "Describe your key responsibilities and achievements..."
- "Add Experience" button: same dashed style as Education
- **No validation** — entirely optional step

---

### Step 3 — Skills

The most complex step. Uses violet/slate color palette.

**Header row:** `flex items-center justify-between`
- Left: "Skill Categories" in `text-sm font-semibold text-slate-700`
- Right: **"Suggest with AI"** button (violet-themed)

**AI Suggest Button:**
- Idle: `bg-violet-600 text-white hover:bg-violet-700 rounded-md px-3 py-1.5 text-sm font-medium`; star SVG icon
- Generating: `bg-violet-100 text-violet-400 cursor-not-allowed`; spinning border indicator + "Generating..."
- Triggers `onRegenerateSkills()` prop (force-refresh=true)

**Auto-generation on step entry:**
When the user navigates TO step 3, the page auto-calls `POST /api/ai/generate-skills` if:
- Skills haven't been generated yet, OR
- `targetRole` or `targetIndustry` changed since last generation

**AI Suggestions Tray** (visible when `skillSuggestions.length > 0`):
- Container: `rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-blue-50 p-4 shadow-[0_4px_20px_rgba(139,92,246,0.12)]`
- Badge: `inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700` — "AI Suggested"
- Hint: `text-xs text-violet-600/70` — "Click to add to first category"
- **Suggestion Chips:**
  - Not added: `cursor-pointer border border-violet-300 bg-white text-violet-800 shadow-sm hover:border-violet-400 hover:bg-violet-50 rounded-md px-3 py-1.5 text-sm`; label "+ skillname"
  - Already added: `cursor-not-allowed bg-violet-200/50 text-violet-400 rounded-md px-3 py-1.5 text-sm`; label "✓ skillname"
  - Click adds skill to category index 0

**Category Cards** (max 5 categories):
- Card: `rounded-lg border-2 border-slate-200 bg-white p-4`
- Category name input: `flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 placeholder-slate-400`, placeholder "Category name (e.g., Frontend, Patient Care, Analytics)"
- Remove category button: `rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500`; X icon; hidden when only 1 category
- **Skill pills**: `inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700`; X remove button `text-slate-400 hover:text-red-500`
- **Per-card add input**: `flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900`, placeholder "Add a skill and press Enter..."
  - Enter key adds skill
  - Add button: `rounded-md bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800`
- Duplicate skills within the same category are rejected (case-insensitive check)

**Add Category button** (hidden at max 5):
- `w-full rounded-lg border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-600`

**Languages Section:**
- Container: `rounded-lg border border-blue-200 bg-blue-50 p-4`
- Title: `text-sm font-semibold text-blue-900` — "Languages"
- Each language row: language name text + proficiency select + remove X
- Proficiency select options: Native, Fluent, Professional, Intermediate, Basic
- Select style: `rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm text-slate-900`
- Add input: `flex-1 rounded-md border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900`, placeholder "e.g., English, Thai, Spanish"
- Add button: `rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700`
- Enter key adds language

**No validation** — entirely optional step.

---

### Step 4 — Summary

- Header: "Professional Summary"
- Subtext: "Write a brief professional summary... Or let AI generate one..."

**Generate with AI button** (inline, above textarea, right-aligned):
- Idle: `inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700`; lightning bolt SVG icon
- Generating: `disabled:cursor-not-allowed disabled:opacity-50`; spinning indicator + "Generating..."
- If summary already has content: `window.confirm("This will replace your existing summary...")` before generating

**Textarea:**
- `rows={6}`, `id="professionalSummary"`
- Max 500 characters enforced on change
- Placeholder: "e.g., Recent Computer Science graduate from XYZ University..."
- Style: `mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`

**Character counter** (below textarea):
- Format: `{charCount} / 500 characters`
- Counter color:
  - `< 100`: `text-red-600 font-medium`
  - `>= 100 && <= 500`: `text-green-600 font-medium`
- Right side message:
  - `> 0 && < 100`: `text-red-600` — "Minimum 100 characters required"
  - `=== 500`: `text-gray-500` — "Maximum length reached"

**API call for generation**: `POST /api/ai/generate-summary` with payload:
```json
{
  "targetRole": "...",
  "targetIndustry": "...",
  "targetCountry": "...",
  "education": [{ "degree": "...", "field": "...", "institution": "..." }],
  "experience": [{ "position": "...", "company": "...", "type": "..." }],
  "projects": [{ "name": "..." }],
  "skills": { "categories": [...] }
}
```
Response: `{ summary: string }`

**Validation (step 4):**
- `professionalSummary` must be non-empty AND >= 100 characters

---

### Step 5 — Additional (optional)

Combines Projects sub-section + Certifications + Extracurriculars.

**Projects sub-section** (embedded `ProjectsStep`):
- Header: "Projects" + subtext "Showcase 2-3 relevant projects to demonstrate your skills."
- Empty state: "No projects added yet."
- Each project: `space-y-3 rounded-lg border border-gray-200 p-4`
- Fields (2-column grid):

| Field         | Type | Required | Placeholder                  |
|---------------|------|----------|------------------------------|
| Project Name  | text | No       | —                            |
| Your Role     | text | No       | e.g. Lead Developer          |
| Technologies  | text | No       | e.g. React, Node.js, PostgreSQL |
| Link          | url  | No       | https://github.com/...       |

- **Description**: `<RichTextEditor>` with `minHeight="80px"`, no placeholder
- "Add Project" button: dashed style

**Certifications** (optional):
- `<RichTextEditor>` with `minHeight="80px"`, placeholder "e.g., AWS Cloud Practitioner, Google Analytics Certified, PMP"

**Extracurricular Activities** (optional):
- `<RichTextEditor>` with `minHeight="80px"`, placeholder "e.g., President of Computer Science Club, Hackathon organizer, Volunteer tutor"

**No validation** — entirely optional step.

---

## 8. RichTextEditor Component

Used in: Education (Relevant Coursework), Experience (Key Responsibilities), Projects (Description), Additional (Certifications, Extracurriculars).

**Library**: Tiptap (`@tiptap/react`, `@tiptap/starter-kit`)

**Enabled features**: paragraph, bold, italic, bullet list, ordered list, history (undo/redo)
**Disabled features**: heading, code, codeBlock, blockquote, horizontalRule

**Outer container**: `mt-1 border border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500`

**Toolbar**: `border-b border-gray-200 bg-gray-50 px-2 py-1 flex gap-1`
- 4 buttons: Bold, Italic, Bullet List, Ordered List
- Button active: `p-1.5 rounded bg-gray-200 text-gray-900`
- Button inactive: `p-1.5 rounded text-gray-600 hover:bg-gray-100`
- Uses `onMouseDown` with `e.preventDefault()` to avoid losing editor focus

**Editor area** CSS (injected via `<style>` tag):
```css
.rich-editor-content { padding: 8px 12px; font-size: 14px; line-height: 1.6; }
.rich-editor-content p { margin: 0; }
.rich-editor-content ul { list-style-type: disc; padding-left: 20px; margin: 4px 0; }
.rich-editor-content ol { list-style-type: decimal; padding-left: 20px; margin: 4px 0; }
.rich-editor-content li { margin-bottom: 2px; }
.rich-editor-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  float: left;
  height: 0;
  pointer-events: none;
}
```

**Props**:
```typescript
interface Props {
  value: string;         // HTML string (from Tiptap's getHTML())
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;    // default "80px"
}
```

**Sync**: `useEffect` syncs external `value` changes into the editor (e.g., AI generation) via `editor.commands.setContent(value || '')`

---

## 9. Save Draft Button

Located in page header, right side.

**States:**

| State   | Classes                                          | Content                        |
|---------|--------------------------------------------------|--------------------------------|
| idle    | `bg-gray-200 text-gray-700 hover:bg-gray-300`   | "Save Draft"                   |
| saving  | `disabled:opacity-50 disabled:cursor-not-allowed` | spinning SVG + "Saving..."    |
| saved   | `bg-green-100 text-green-700 hover:bg-green-200` | checkmark SVG + "Saved"       |
| error   | `bg-red-100 text-red-700 hover:bg-red-200`      | warning SVG + "Save Failed"   |

- `saved` → resets to `idle` after 2 seconds
- `error` → resets to `idle` after 3 seconds
- Button disabled while `status === 'saving'` or `status === 'analyzing'`
- All states: `flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors`

**API call**: `POST /api/resume/draft/save` with `{ formData, resumeId }`. Response: `{ resumeId }`.

---

## 10. Submit Flow (UploadProgress)

After clicking "Submit & Generate" on the last step, `status` is set to `'analyzing'` and the `<UploadProgress>` component appears below the form card (`mt-4`).

The `UploadProgress` component displays different UI depending on `status`:
- `'analyzing'` — progress/spinner state
- `'success'` — success state
- `'error'` — error state with `errorMessage` prop

On success: `setTimeout(() => navigate('/build/${result.resume.id}', { state: { justCompleted: true } }), 1500)`

**API call**: `POST /api/resume/build` with `{ ...formData, templateId: selectedTemplate }`
Response: `{ resume: { id: string } }`

---

## 11. Completion View

Shown when `location.state?.justCompleted === true` and `resumeId` is set.

```
┌─────────────────────────────────────────────────────────────┐
│ <- Dashboard  |  [green check] Your Resume is Ready!        │
│                         [Edit] [Export PDF] [Analyze Resume ->] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              [Full-screen ResumePreview]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Header**: `flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 shadow-sm`
- Max width: `max-w-screen-xl mx-auto`
- Left: back arrow + "Dashboard" link + divider + green checkmark icon + "Your Resume is Ready!"
- Right buttons:
  - **Edit**: `rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50`; navigates to `/build/:id`
  - **Export PDF**: same style; calls `handleExportPdf()`
  - **Analyze Resume**: `rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700`; right arrow icon; navigates to `/resume/:id`

**Preview area**: `flex-1 overflow-hidden p-4` with `<ResumePreview>` filling height. `onChooseTemplate` is a no-op in this view.

**Page root**: `flex flex-col h-screen bg-gray-50`

---

## 12. Draft Loading Spinner

Shown when `isLoadingDraft === true` (URL has `:id` param and fetch is in progress).

```jsx
<div className="flex h-screen items-center justify-center">
  <div className="flex flex-col items-center gap-3">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
    <span className="text-sm text-gray-500">Loading draft...</span>
  </div>
</div>
```

---

## 13. Live Preview Panel (Right Column)

The `ResumePreview` component (memoized with `React.memo`).

**Outer wrapper**: `flex h-full flex-col bg-gray-100`

### Header (sticky)
- `sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm`
- Left: "Live Preview" in `text-sm font-medium text-gray-700`
- Center: **Zoom Controls**
- Right: **"Choose Template"** button

### Zoom Controls
- Zoom out button: `flex h-7 w-7 items-center justify-center rounded border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40` — label "-"
- Percent display: `w-11 text-center text-xs tabular-nums text-gray-600` — e.g. "75%"
- Zoom in button: same style as zoom out — label "+"
- Fit button: `ml-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-50` — label "Fit"
- Zoom range: 25% to 150%, step 10%
- **Auto fit-to-width on mount and window resize** (debounced 150ms)

### Choose Template Button
- `flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50`
- Palette emoji icon + template name (underscores replaced with spaces) or "Choose Template"
- On click: opens Template Switcher modal

### Scrollable Preview Area
- `flex-1 overflow-auto p-6`
- **Sizer div**: `mx-auto`, width = `pageWidthPx * zoom` (816 * zoom)
- **Transform div**: width = 816px, `transform: scale(${zoom})`, `transformOrigin: 'top left'`
- **Page div**: `bg-white shadow-lg`, `width: '100%'` — contains `<ResumeTemplateSwitcher templateId={templateId} data={data} />`

### Footer
- `border-t border-gray-200 bg-white px-4 py-2`
- Text: `text-center text-xs text-gray-500` — "Preview updates automatically as you fill the form"

### Debouncing
- `formData` is debounced 300ms before being passed to `ResumePreview` as `debouncedFormData`

---

## 14. Template Switcher Modal

Triggered by "Choose Template" button in preview header. Rendered as a fullscreen overlay over the page.

**Overlay container**: `fixed inset-0 bg-white z-50 overflow-y-auto`
**Inner container**: `max-w-6xl mx-auto p-6`

### TemplateSwitcher component

**Header**:
- Title: `text-2xl font-bold text-gray-900` — "Choose a Template"
- Subtext (varies):
  - With saved resume: "Switch templates anytime — your content is always preserved"
  - No saved resume: "Preview templates — save a draft to persist your selection"
- User tier badge (if not free): `text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full` — "✨ {tier} plan"
- Close button (top-right): `text-gray-400 hover:text-gray-600 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-2xl` — "×"

**Category Filter** (pill tabs):
- All, Modern, ATS
- Active: `bg-blue-500 text-white`
- Inactive: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Style: `px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap`

**Template Grid**: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`

**TemplateCard**:
- Container: `relative rounded-xl border-2 transition-all cursor-pointer`
  - Default: `border-gray-200 hover:border-blue-300 hover:shadow-md`
  - Selected: `border-blue-500 shadow-lg ring-2 ring-blue-200`
  - Locked: `opacity-60 cursor-not-allowed`
- **Thumbnail area**: `aspect-[8.5/11] bg-gray-50 rounded-t-xl overflow-hidden`; shows `<img>` or fallback placeholder
- **Lock badge** (top-right, if locked): `absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold` — "🔒 {tier}"
- **Active badge** (top-left, if selected): `absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold` — "✓ Active"
- **ATS badge** (bottom-right area, if ATS-friendly): `absolute bottom-14 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold` — "ATS"
- **Info area**: `p-3 border-t border-gray-100`
  - Name: `font-semibold text-gray-900 text-sm truncate`
  - Description: `text-xs text-gray-500 mt-0.5 line-clamp-2`
  - Tier badge (if not free): `text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full capitalize`

**On template select:**
- Locked: shows `<UpgradePrompt>` modal
- Not locked + has resumeId: calls `POST /api/resume/:resumeId/switch-template` then closes modal
- Not locked + no resumeId: calls `onTemplateChanged(template)` + closes modal (local preview only)

**Switching overlay**: `fixed inset-0 bg-black/50 flex items-center justify-center z-50`; white card with spinner + "Switching template..."

---

## 15. State Management

All state lives in `ResumeBuilderPage`. Step components are stateless except for local UI state (skill input values, summary generation loading).

```typescript
// Core form state
const [currentStep, setCurrentStep] = useState(0);
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
const [debouncedFormData, setDebouncedFormData] = useState<ResumeFormData>(initialFormData);
const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern_yellow_split');
const [resumeId, setResumeId] = useState<string | null>(null);

// UI state
const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
const [status, setStatus] = useState<UploadStatus | null>(null);
const [errorMessage, setErrorMessage] = useState('');
const [currentTemplateName, setCurrentTemplateName] = useState<string | undefined>(undefined);
const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false);
const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [stepErrors, setStepErrors] = useState<string[]>([]);
const [isLoadingDraft, setIsLoadingDraft] = useState(false);

// Skills AI state
const [skillsGenerated, setSkillsGenerated] = useState(false);
const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
const [lastGeneratedRole, setLastGeneratedRole] = useState('');
const [lastGeneratedIndustry, setLastGeneratedIndustry] = useState('');
const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
```

---

## 16. LocalStorage

**Key**: `resumeBuilder_selectedTemplate`

**Write**: on every `selectedTemplate` change via `useEffect`
**Read**: on mount; validated against `VALID_TEMPLATE_IDS`

```typescript
const VALID_TEMPLATE_IDS: TemplateId[] = [
  'modern_yellow_split',
  'dark_ribbon_modern',
  'modern_minimalist_block',
  'editorial_earth_tone',
  'ats_clean',
  'ats_lined',
];
```

---

## 17. Routing & URL Params

- Route: `/build` — new resume
- Route: `/build/:id` — load draft with ID from URL param
- After submit success: `navigate('/build/${result.resume.id}', { state: { justCompleted: true } })`
- Completion view check: `const isCompleted = location.state?.justCompleted === true`
- Draft load error: `navigate('/build')` (empty builder)
- Completion Edit button: `navigate('/build/${resumeId}', { replace: true })` (clears completion state)

---

## 18. API Endpoints

All endpoints require authentication (session cookie). Base URL: `/api`.

| Method | Endpoint                           | Description                        | Payload / Notes                         |
|--------|------------------------------------|------------------------------------|----------------------------------------|
| POST   | `/resume/build`                    | Generate resume from form data     | `{ ...ResumeFormData, templateId }`     |
| POST   | `/resume/draft/save`               | Save draft                         | `{ formData, resumeId? }`; returns `{ resumeId }` |
| GET    | `/resume/draft/:id`                | Load draft                         | Returns `{ formData }`                 |
| POST   | `/ai/generate-skills`              | AI skill suggestions               | `{ targetRole, targetIndustry, forceRefresh? }`; returns `{ categories, languages }` |
| POST   | `/ai/generate-summary`             | AI professional summary            | See step 4 payload; returns `{ summary }` |
| POST   | `/export/pdf-from-html`            | Export PDF from rendered HTML      | `{ html: string }`; returns PDF blob   |
| GET    | `/templates`                       | List all templates                 | Returns `{ templates, userTier }`      |
| POST   | `/resume/:resumeId/switch-template`| Switch template for saved resume   | `{ templateId }`                       |

---

## 19. Data Types

### ResumeFormData
```typescript
interface ResumeFormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[];
  profilePhoto?: string;            // base64 data URL
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
  targetIndustry: string;

  // Step 2: Education
  education: Education[];

  // Step 3: Experience
  experience: Experience[];

  // Step 5 (Additional): Projects — embedded in AdditionalStep
  projects: Project[];

  // Step 4: Skills
  skills: {
    categories: SkillCategory[];
    languages: LanguageSkill[];
  };

  // Step 5: Summary
  professionalSummary: string;

  // Step 6: Additional
  certifications?: string;       // HTML string from RichTextEditor
  extracurriculars?: string;     // HTML string from RichTextEditor
}
```

### Sub-types
```typescript
interface AdditionalLink {
  id: string;        // Date.now().toString()
  label: string;     // max 30 chars, e.g. "GitHub"
  url: string;
}

interface Education {
  degreeType: string;
  major: string;
  university: string;
  graduationDate: string;   // "YYYY-MM" (month input)
  gpa?: string;
  relevantCoursework: string;  // HTML string
  honors?: string;
}

interface Experience {
  type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
  company: string;
  role: string;
  duration: string;
  responsibilities: string;  // HTML string
  industry?: string;
}

interface Project {
  name: string;
  description: string;  // HTML string
  technologies: string;
  role: string;
  link?: string;
}

interface SkillCategory {
  category: string;   // e.g. "Frontend", "Patient Care"
  items: string[];    // e.g. ["Python", "React"]
}

interface LanguageSkill {
  language: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}

type TemplateId = 'modern_yellow_split' | 'dark_ribbon_modern' | 'modern_minimalist_block' | 'editorial_earth_tone' | 'ats_clean' | 'ats_lined';
```

### Initial form data
```typescript
const initialFormData: ResumeFormData = {
  fullName: '', email: '', phone: '', city: '', country: '',
  linkedinUrl: '', portfolioUrl: '', additionalLinks: [],
  targetRole: '', targetIndustry: '', targetCountry: '', targetCity: '',
  education: [{ degreeType: '', major: '', university: '', graduationDate: '', relevantCoursework: '' }],
  experience: [],
  projects: [],
  skills: { categories: [{ category: '', items: [] }], languages: [] },
  professionalSummary: '',
  certifications: '',
  extracurriculars: '',
};
```

---

## 20. Template System

Templates are React components that receive `data: ResumeFormData` and render a complete resume.

### Template IDs and Characteristics

| TemplateId                | Layout           | Photo | Category |
|---------------------------|------------------|-------|----------|
| `modern_yellow_split`     | 2-col yellow     | Yes   | modern   |
| `dark_ribbon_modern`      | 2-col dark sidebar | Yes | modern   |
| `modern_minimalist_block` | 2-col dark sidebar | Yes | modern   |
| `editorial_earth_tone`    | 2-col earth tones | Yes  | modern   |
| `ats_clean`               | Single-column    | No    | ats      |
| `ats_lined`               | Single-column    | No    | ats      |

### ResumeTemplateSwitcher
Maps `templateId` string to the corresponding template component. Falls back to `ModernYellowSplitTemplate`.

### Template rendering rules
- Templates use **inline styles only** (no Tailwind needed — must work in Puppeteer for PDF export)
- Outermost div: `width: '100%'` and `minHeight: '100%'` (NOT fixed `8.5in`)
- PDF export: templates are rendered to HTML via `flushSync` + `createRoot`, then POSTed to `/api/export/pdf-from-html`

---

## 21. Unsaved Changes Guard

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

`hasUnsavedChanges` is set `true` whenever `formData` changes, and `false` after a successful save or submit.

---

## 22. Draft Migration (legacy shape)

When loading a draft, the `skills` shape is normalized to handle old data:

```typescript
const normalizeDraftSkills = (fd: any): ResumeFormData => ({
  ...fd,
  skills: {
    categories: fd.skills?.categories ?? fd.skills?.technical ?? [{ category: '', items: [] }],
    languages: fd.skills?.languages ?? [],
  },
});
```

---

## 23. Pre-completion Step State from Draft

When loading a draft, steps are pre-marked completed based on data:

```typescript
if (fd.fullName && fd.email && fd.phone && fd.city && fd.country && fd.targetRole && fd.targetIndustry && fd.targetCountry) preCompleted.add(0);
if (fd.education.length > 0 && fd.education[0].degreeType) preCompleted.add(1);
preCompleted.add(2); // Experience is optional
preCompleted.add(3); // Skills is optional
if (fd.professionalSummary && fd.professionalSummary.length >= 100) preCompleted.add(4);
preCompleted.add(5); // Additional is optional
```

---

## 24. Step Visit Tracking

Any step is marked "completed" (checked) the moment the user arrives on it:

```typescript
useEffect(() => {
  setCompletedSteps((prev) => new Set([...prev, currentStep]));
}, [currentStep]);
```

This means the step indicator shows a checkmark for all visited steps even without passing validation.
