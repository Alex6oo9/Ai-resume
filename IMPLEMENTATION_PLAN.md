# Live Preview Feature - Implementation Plan

## 📊 Codebase Review: What Exists vs. What's Needed

### ✅ **What We Can Reuse**

#### **Backend Services (95% ready)**
- ✅ **AI Services**: `resumeGenerator.ts`, `resumeAnalyzer.ts` - can be adapted for skills/summary generation
- ✅ **Export Services**: `pdfGenerator.ts`, `markdownGenerator.ts` - ready to use
- ✅ **OpenAI Integration**: Already configured in `config/openai.ts`
- ✅ **Database**: Tables `resumes` and `resume_data` already exist and suitable
- ✅ **Auth Middleware**: `isAuthenticated` ready to protect routes

#### **Frontend Components (60% ready)**
- ✅ **Form Steps**: 7 step components already exist in `components/resume-builder/steps/`
  - `BasicInfoStep.tsx`
  - `TargetRoleStep.tsx`
  - `EducationStep.tsx`
  - `ExperienceStep.tsx`
  - `ProjectsStep.tsx`
  - `SkillsStep.tsx`
  - `AdditionalStep.tsx`
- ✅ **State Management**: `ResumeBuilderPage.tsx` already manages multi-step form state
- ✅ **Navigation**: `StepIndicator` component exists
- ✅ **Export UI**: `ExportButtons.tsx` component exists
- ✅ **Toast Notifications**: Already implemented
- ✅ **Auth Context**: `useAuth` hook ready

#### **Data Types (80% ready)**
- ✅ `ResumeFormData` interface already defined with all 7 sections
- ✅ `Education`, `Experience`, `Project`, `Language` interfaces exist
- ⚠️ **Needs modification**: Skills structure (currently flat string, needs nested categories)

---

### 🔨 **What Needs to Be Built**

#### **Backend - NEW Components**

1. **AI Skills Generator Service** (NEW)
   - File: `server/src/services/ai/skillsGenerator.ts`
   - Generate skills based on target role/industry
   - Return structured JSON: `{ technical: [...], soft: [...], languages: [...] }`

2. **AI Summary Generator Service** (NEW)
   - File: `server/src/services/ai/summaryGenerator.ts`
   - Generate summary using full resume context
   - Input: formData, Output: professional summary string

3. **Template Configuration** (NEW)
   - File: `server/src/templates/templateConfig.ts`
   - Define ATS and Simple template styles/settings
   - Used by both frontend preview and PDF export

4. **Resume Save/Draft API** (NEW)
   - Endpoint: `POST /api/resume/draft/save`
   - Save incomplete resume progress
   - Update `resume_data` table

5. **Resume Load/Draft API** (NEW)
   - Endpoint: `GET /api/resume/draft/:id`
   - Load saved draft for editing
   - Retrieve from `resume_data` table

#### **Frontend - NEW Components**

1. **Live Preview Panel** (NEW - CORE FEATURE)
   - File: `client/src/components/live-preview/ResumePreview.tsx`
   - Two-panel layout container
   - Real-time rendering with debouncing
   - Template switching

2. **Template Renderer** (NEW)
   - File: `client/src/components/live-preview/TemplateRenderer.tsx`
   - Render resume based on template config
   - Supports ATS and Simple templates

3. **Template Selector** (NEW)
   - File: `client/src/components/live-preview/TemplateSelector.tsx`
   - UI for switching between templates
   - Template preview modal

4. **Section Renderers** (NEW)
   - `client/src/components/live-preview/sections/`
   - Individual components for each resume section:
     - `ContactSection.tsx`
     - `SummarySection.tsx`
     - `EducationSection.tsx`
     - `ExperienceSection.tsx`
     - `ProjectsSection.tsx`
     - `SkillsSection.tsx`
     - `AdditionalSection.tsx`

5. **Save Draft Button** (NEW)
   - Add to header in `ResumeBuilderPage.tsx`
   - Manual save functionality
   - Unsaved changes warning

#### **Frontend - MAJOR MODIFICATIONS**

1. **ResumeBuilderPage.tsx** (MODIFY)
   - Add two-panel layout
   - Integrate live preview panel
   - Add manual save logic
   - Add template selection state
   - Add unsaved changes tracking

2. **Form Steps** (MODIFY)
   - **TargetRoleStep.tsx**: Add "Target Industry" dropdown
   - **BasicInfoStep.tsx**: Add "Additional Links" feature (dynamic add/remove)
   - **SkillsStep.tsx**: Complete rewrite - AI pre-population, nested categories, chips UI
   - **AdditionalStep.tsx**: Move Professional Summary here (currently in step 6)

3. **Type Definitions** (MODIFY)
   - `client/src/types/index.ts`: Update `ResumeFormData` skills structure
   - Add `Template` interface
   - Add `TemplateId` type

---

## 📋 **Detailed Implementation Plan**

### **Phase 1: Foundation & Template System** (Week 1)
*Goal: Set up template infrastructure and modify data structures*

#### Backend Tasks
- [ ] **1.1** Create template config system
  - Create `server/src/templates/templateConfig.ts`
  - Define `Template` interface
  - Configure ATS and Simple templates (fonts, spacing, colors)
  - Export `TEMPLATES` constant

- [ ] **1.2** Update TypeScript types
  - Add skills structure to match new spec (nested categories)
  - Add `additionalLinks` to `basics` object
  - Add `targetIndustry` field

#### Frontend Tasks
- [ ] **1.3** Update type definitions
  - Modify `client/src/types/index.ts`
  - Add new `Template` interface
  - Update `ResumeFormData` skills structure:
    ```typescript
    skills: {
      technical: Array<{ category: string; items: string[] }>;
      soft: string[];
      languages: Array<{ language: string; proficiency: string }>;
    }
    ```
  - Add `additionalLinks` to basics

- [ ] **1.4** Create template preview thumbnails
  - Generate static images for template selection
  - Store in `client/public/assets/templates/`
  - (Can use Puppeteer script or manual screenshots for MVP)

**Deliverable**: Template system ready, types updated across frontend and backend

---

### **Phase 2: AI Services for Skills & Summary** (Week 1-2)
*Goal: Build AI endpoints for auto-generation*

#### Backend Tasks
- [ ] **2.1** Create Skills Generator Service
  - File: `server/src/services/ai/skillsGenerator.ts`
  - Function: `generateSkills(targetRole: string, targetIndustry: string)`
  - Use GPT-4o-mini with structured JSON output
  - Include tests: `__tests__/skillsGenerator.test.ts`

- [ ] **2.2** Create Summary Generator Service
  - File: `server/src/services/ai/summaryGenerator.ts`
  - Function: `generateSummary(formData: Partial<ResumeFormData>)`
  - Use context from education, experience, projects, skills
  - Include tests: `__tests__/summaryGenerator.test.ts`

- [ ] **2.3** Create API Endpoints
  - `POST /api/ai/generate-skills` - controller in `controllers/aiController.ts`
  - `POST /api/ai/generate-summary` - same controller
  - Add to routes: `server/src/routes/ai/index.ts`
  - Require authentication middleware

- [ ] **2.4** Write controller tests
  - Test skills generation endpoint
  - Test summary generation endpoint
  - Mock OpenAI responses

**Deliverable**: AI generation APIs ready and tested

---

### **Phase 3: Modified Form Steps** (Week 2)
*Goal: Update existing form components to match new spec*

#### Frontend Tasks
- [ ] **3.1** Update BasicInfoStep.tsx
  - Add "Additional Links" section
  - Add/remove dynamic link inputs (max 3)
  - Dropdown for link type: GitHub, Behance, Medium, etc.
  - Update form state handling

- [ ] **3.2** Update TargetRoleStep.tsx
  - Add "Target Industry" dropdown
  - Options: Technology, Marketing, Sales, Finance, etc.
  - Add autocomplete for target role input

- [ ] **3.3** Rewrite SkillsStep.tsx
  - **NEW UI**: Category-based chips/tags interface
  - Auto-populate skills on component mount (call AI API)
  - Show loading state: "Generating skills for [role]..."
  - Allow add/remove skills per category
  - Add "Add New Category" button
  - Soft skills: multi-select chips
  - Languages: proficiency dropdown per language

- [ ] **3.4** Update AdditionalStep.tsx
  - Move Professional Summary field here (from current position)
  - Add "Generate Summary" button
  - Call `/api/ai/generate-summary` endpoint
  - Show loading state while generating
  - Allow manual editing after generation

- [ ] **3.5** Update ExperienceStep.tsx
  - Add "Industry" optional field
  - Ensure bullet points are properly formatted

- [ ] **3.6** Update ProjectsStep.tsx
  - Rename "Technologies" label to "Technologies/Tools" dynamically based on role

**Deliverable**: All 7 form steps updated to match specification

---

### **Phase 4: Live Preview Components** (Week 3)
*Goal: Build the core live preview feature*

#### Frontend Tasks
- [ ] **4.1** Create Preview Panel Component
  - File: `client/src/components/live-preview/ResumePreview.tsx`
  - Props: `data: ResumeFormData`, `templateId: string`
  - Wrapper with white background, shadow, scrollable
  - Sticky header with template selector

- [ ] **4.2** Create Template Renderer
  - File: `client/src/components/live-preview/TemplateRenderer.tsx`
  - Load template config from `TEMPLATES` constant
  - Apply template styles (fonts, spacing, colors)
  - Render sections in order defined by template

- [ ] **4.3** Create Section Renderers
  - `components/live-preview/sections/ContactSection.tsx`
  - `components/live-preview/sections/SummarySection.tsx`
  - `components/live-preview/sections/EducationSection.tsx`
  - `components/live-preview/sections/ExperienceSection.tsx`
  - `components/live-preview/sections/ProjectsSection.tsx`
  - `components/live-preview/sections/SkillsSection.tsx`
  - `components/live-preview/sections/AdditionalSection.tsx`
  - Each renders data according to template styles

- [ ] **4.4** Create Template Selector
  - File: `client/src/components/live-preview/TemplateSelector.tsx`
  - Show ATS and Simple template options
  - Display thumbnail images
  - "Preview" button opens modal with full sample
  - Selection updates parent state

- [ ] **4.5** Add Template Preview Modal
  - Show full-page sample resume in selected template
  - Close button
  - Use sample data from template config

**Deliverable**: Live preview renders resume in real-time

---

### **Phase 5: Two-Panel Layout Integration** (Week 3-4)
*Goal: Integrate preview panel into ResumeBuilderPage*

#### Frontend Tasks
- [ ] **5.1** Modify ResumeBuilderPage.tsx Layout
  - Change from single-column to two-column grid
  - Left panel (40%): Form + navigation
  - Right panel (60%): Live preview
  - Responsive: Stack vertically on mobile (tab layout)

- [ ] **5.2** Add Template State Management
  - Add `activeTemplate` state: `'ats' | 'simple'`
  - Default to 'ats'
  - Pass to preview panel
  - Persist selection

- [ ] **5.3** Add Real-Time Preview Updates
  - Debounce form input changes (300ms)
  - Use `useEffect` to trigger preview re-render
  - Memoize preview component with `React.memo`

- [ ] **5.4** Mobile Responsive Layout
  - Tab switcher: "Edit" vs "Preview"
  - Show only active tab on mobile screens
  - Use Tailwind breakpoints: `lg:grid lg:grid-cols-[40%_60%]`

**Deliverable**: Full two-panel live preview experience

---

### **Phase 6: Save & Load Draft Feature** (Week 4)
*Goal: Manual save system (no auto-save)*

#### Backend Tasks
- [ ] **6.1** Create Draft Save Endpoint
  - Endpoint: `POST /api/resume/draft/save`
  - Update `resume_data` table with current form state
  - Update `resumes.updated_at` timestamp
  - Return success message

- [ ] **6.2** Create Draft Load Endpoint
  - Endpoint: `GET /api/resume/draft/:id`
  - Retrieve `form_data` from `resume_data` table
  - Return full `ResumeFormData` object

- [ ] **6.3** Add tests for save/load
  - Test draft save controller
  - Test draft load controller
  - Verify data persistence

#### Frontend Tasks
- [ ] **6.4** Add Save Draft Button
  - Add to header in `ResumeBuilderPage.tsx`
  - States: "Save Draft", "Saving...", "✓ Saved", "⚠ Save Failed"
  - Call `POST /api/resume/draft/save` on click
  - Show toast notification on success/error

- [ ] **6.5** Add Unsaved Changes Tracking
  - Track `hasUnsavedChanges` state
  - Set to `true` when form data changes
  - Reset to `false` after successful save
  - Show warning on page exit if unsaved

- [ ] **6.6** Add Load Draft Functionality
  - On dashboard, "Continue Editing" button for saved drafts
  - Load draft data on `ResumeBuilderPage` mount
  - Populate all form fields with saved data

**Deliverable**: Manual save/load system working

---

### **Phase 7: Export with Templates** (Week 4-5)
*Goal: PDF/Markdown export using selected template*

#### Backend Tasks
- [ ] **7.1** Modify PDF Generator
  - Update `server/src/services/export/pdfGenerator.ts`
  - Accept `templateId` parameter
  - Load template config
  - Render HTML using template styles
  - Generate PDF with Puppeteer

- [ ] **7.2** Modify Markdown Generator
  - Update `server/src/services/export/markdownGenerator.ts`
  - Use template's section order
  - Format according to template preferences

- [ ] **7.3** Update Export Controller
  - Modify `server/src/controllers/exportController.ts`
  - Pass `templateId` from request body
  - Use template-aware generators

#### Frontend Tasks
- [ ] **7.4** Update Export Buttons
  - Modify `client/src/components/export/ExportButtons.tsx`
  - Pass current `templateId` to export API
  - Show loading state during export
  - Trigger browser download on success

- [ ] **7.5** Add Export Validation
  - Check if resume is complete before export
  - Show modal with missing required fields
  - Option: "Continue anyway" or "Go back"

**Deliverable**: Export generates PDF/MD using selected template

---

### **Phase 8: Section Order Change** (Week 5)
*Goal: Reorder sections to match new spec*

#### Tasks
- [ ] **8.1** Update Step Order
  - Current: Basic → Target → Education → Experience → Projects → Skills → Additional
  - **NEW**: Personal (merge Basic+Target) → Education → Experience → Projects → Skills → Summary → Additional
  - Combine `BasicInfoStep` and `TargetRoleStep` into one `PersonalInfoStep`
  - Move Professional Summary to step 6 (after Skills)

- [ ] **8.2** Update STEP_LABELS
  - Modify `ResumeBuilderPage.tsx` step labels
  - Update `StepIndicator` component to show 7 steps

- [ ] **8.3** Update Form Validation
  - Validate new section order
  - Update required field checks

**Deliverable**: Sections in correct order: Personal → Education → Experience → Projects → Skills → Summary → Additional

---

### **Phase 9: Polish & Testing** (Week 5-6)
*Goal: Refinement, error handling, comprehensive tests*

#### Backend Tasks
- [ ] **9.1** Add Error Handling
  - Graceful AI API failures (show user-friendly errors)
  - Validate input data in all AI endpoints
  - Rate limiting for AI calls (prevent abuse)

- [ ] **9.2** Add Caching for Skills
  - Cache common `targetRole` → skills mappings
  - Use in-memory cache or Redis
  - Reduce OpenAI API costs

- [ ] **9.3** Comprehensive Testing
  - Test all new AI services with mocks
  - Test save/load draft endpoints
  - Test export with templates
  - Integration tests for full flow

#### Frontend Tasks
- [ ] **9.4** Add Loading States
  - Skills generation: "Generating skills for [role]..."
  - Summary generation: "Generating summary..."
  - Save draft: "Saving..."
  - Export: "Generating PDF..."

- [ ] **9.5** Add Error Boundaries
  - Catch preview rendering errors
  - Show fallback UI if template fails to load

- [ ] **9.6** Form Validation UI
  - Inline error messages for required fields
  - Red borders on invalid inputs
  - Error summary at section bottom
  - Disable "Next" if current section invalid

- [ ] **9.7** ATS Warnings (Optional)
  - Show warnings for missing metrics in experience
  - Alert if resume > 2 pages in preview
  - Suggest adding summary if missing

- [ ] **9.8** Accessibility
  - Keyboard navigation for form
  - ARIA labels for template selector
  - Focus management for modals

- [ ] **9.9** Frontend Testing
  - Test all modified form steps
  - Test live preview rendering
  - Test template switching
  - Test save/load functionality
  - Test export buttons

**Deliverable**: Production-ready feature with comprehensive tests

---

### **Phase 10: Mobile Optimization** (Week 6)
*Goal: Ensure mobile responsiveness*

#### Tasks
- [ ] **10.1** Mobile Layout
  - Implement tab switcher: "Edit" | "Preview"
  - Single column layout on mobile
  - Touch-friendly buttons and inputs
  - Test on actual mobile devices

- [ ] **10.2** Performance Optimization
  - Lazy load preview panel
  - Optimize debounce timing for mobile
  - Reduce bundle size (code splitting)

- [ ] **10.3** Cross-Browser Testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test mobile Safari and Chrome mobile
  - Fix any rendering inconsistencies

**Deliverable**: Fully responsive, mobile-friendly feature

---

## 🗂️ **File Structure Summary**

### New Files to Create

#### Backend
```
server/src/
├── services/
│   ├── ai/
│   │   ├── skillsGenerator.ts          [NEW]
│   │   ├── summaryGenerator.ts         [NEW]
│   │   └── __tests__/
│   │       ├── skillsGenerator.test.ts [NEW]
│   │       └── summaryGenerator.test.ts [NEW]
│   └── templates/
│       └── templateConfig.ts           [NEW]
├── controllers/
│   └── aiController.ts                 [NEW]
├── routes/
│   └── ai/
│       └── index.ts                    [NEW]
```

#### Frontend
```
client/src/
├── components/
│   ├── live-preview/                   [NEW FOLDER]
│   │   ├── ResumePreview.tsx
│   │   ├── TemplateRenderer.tsx
│   │   ├── TemplateSelector.tsx
│   │   ├── sections/
│   │   │   ├── ContactSection.tsx
│   │   │   ├── SummarySection.tsx
│   │   │   ├── EducationSection.tsx
│   │   │   ├── ExperienceSection.tsx
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   └── AdditionalSection.tsx
│   │   └── __tests__/
│   │       ├── ResumePreview.test.tsx
│   │       └── TemplateRenderer.test.tsx
│   └── resume-builder/
│       └── steps/
│           └── PersonalInfoStep.tsx    [NEW - merge Basic+Target]
├── pages/
│   └── ResumeBuilderPage.tsx           [MODIFY - two-panel layout]
└── types/
    └── index.ts                        [MODIFY - update interfaces]
```

### Files to Modify

#### Backend
- `server/src/controllers/exportController.ts` - add templateId support
- `server/src/services/export/pdfGenerator.ts` - use template config
- `server/src/services/export/markdownGenerator.ts` - use template config

#### Frontend
- `client/src/types/index.ts` - update ResumeFormData skills structure
- `client/src/components/resume-builder/steps/BasicInfoStep.tsx` - add additional links
- `client/src/components/resume-builder/steps/TargetRoleStep.tsx` - add industry dropdown
- `client/src/components/resume-builder/steps/SkillsStep.tsx` - complete rewrite
- `client/src/components/resume-builder/steps/AdditionalStep.tsx` - add summary generation
- `client/src/pages/ResumeBuilderPage.tsx` - two-panel layout, save draft

---

## 📊 **Effort Estimation**

| Phase | Description | Estimated Time | Complexity |
|-------|-------------|----------------|------------|
| Phase 1 | Foundation & Templates | 3-4 days | Medium |
| Phase 2 | AI Services | 3-4 days | Medium |
| Phase 3 | Modified Form Steps | 4-5 days | Medium-High |
| Phase 4 | Live Preview Components | 5-6 days | High |
| Phase 5 | Two-Panel Integration | 3-4 days | Medium |
| Phase 6 | Save/Load Draft | 2-3 days | Low-Medium |
| Phase 7 | Export with Templates | 2-3 days | Medium |
| Phase 8 | Section Order Change | 1-2 days | Low |
| Phase 9 | Polish & Testing | 5-7 days | Medium-High |
| Phase 10 | Mobile Optimization | 3-4 days | Medium |
| **TOTAL** | | **31-42 days** | **6-8 weeks** |

---

## 🎯 **Quick Start Recommendations**

### Option A: Start with High-Value Features
1. **Week 1**: Phase 1 + Phase 2 (Templates + AI Services)
2. **Week 2**: Phase 4 (Live Preview - CORE)
3. **Week 3**: Phase 5 (Integration)
4. **Week 4**: Phase 3 + 6 + 7 (Form updates + Save/Export)

### Option B: Incremental Build
1. **Week 1**: Phase 1 (Foundation)
2. **Week 2**: Phase 3 (Form updates)
3. **Week 3**: Phase 2 + 4 (AI + Preview)
4. **Week 4**: Phase 5 + 6 + 7 (Integration + Save + Export)

### Recommended: **Option A**
- Gets live preview working faster
- Shows progress to stakeholders early
- Core feature (live preview) done by week 3

---

## 🚨 **Critical Dependencies**

1. **Phase 1 must complete first** - template system required for all other phases
2. **Phase 2 (AI services) blocks Phase 3** - skills/summary generation needed for form steps
3. **Phase 4 blocks Phase 5** - preview components must exist before integration
4. **Phase 7 depends on Phase 1** - export needs template config

---

## 🧪 **Testing Strategy**

### Unit Tests
- All AI services (mock OpenAI)
- All controllers (mock DB + services)
- All section renderers (snapshot tests)
- Form step components (user interaction)

### Integration Tests
- Full resume build flow (form → save → load)
- Export flow (form → generate → download)
- AI generation flow (trigger → API → UI update)

### E2E Tests (Optional)
- Complete user journey: create account → build resume → preview → export
- Template switching and preview update
- Save draft and reload

---

## 📝 **Success Criteria**

✅ Feature is complete when:
- [ ] User can fill 7-step form with live preview updating in real-time
- [ ] Skills auto-populate based on target role
- [ ] Summary generates using full resume context
- [ ] User can switch between ATS and Simple templates
- [ ] User can manually save draft at any time
- [ ] User can export PDF and Markdown in selected template
- [ ] All sections render correctly in both templates
- [ ] Mobile responsive (tab layout)
- [ ] All tests passing (>80% coverage)
- [ ] No console errors or warnings
- [ ] Performance: Preview updates within 300ms of input change

---

## 🔄 **Migration Notes**

### Database Changes
**No new migrations required!** ✅
- `resumes` table: already has all needed columns
- `resume_data` table: JSONB `form_data` can store updated structure
- Simply update the shape of data stored in `form_data` JSONB field

### API Changes
**New endpoints only, no breaking changes** ✅
- `/api/ai/generate-skills` (NEW)
- `/api/ai/generate-summary` (NEW)
- `/api/resume/draft/save` (NEW)
- `/api/resume/draft/:id` (NEW)
- Existing endpoints remain unchanged

### Data Migration
**No user data migration needed** ✅
- New features are additive
- Old resumes remain compatible
- New fields are optional

---

## 📦 **Dependencies to Add**

### None! ✅
All required packages already installed:
- OpenAI API ✅
- Puppeteer ✅
- React + TypeScript ✅
- TailwindCSS ✅
- Testing libraries ✅

---

## 🎨 **Design System Notes**

Reuse existing Tailwind classes from current components:
- Buttons: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md`
- Inputs: `border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500`
- Cards: `bg-white border border-gray-200 shadow-sm rounded-lg p-6`
- Text colors: `text-gray-900` (headings), `text-gray-700` (body)

---

## 🏁 **Next Steps**

1. ✅ **Review this plan** - Confirm approach and priorities
2. ⬜ **Choose starting phase** - Recommend Phase 1 (Foundation)
3. ⬜ **Set up task tracking** - Use GitHub issues or project board
4. ⬜ **Begin implementation** - Start with template config system

---

**Ready to proceed?** Let me know which phase to start with! 🚀
