# Live Preview Feature - Design Decisions

**Date**: 2026-02-14
**Branch**: `live-preview-feature`
**Status**: Decision Log

---

## 📋 **Confirmed Decisions**

### **1. Personal Information & Links**

#### Q1.1 - Additional Links Button Visibility
**Decision**: PENDING - Need to decide:
- Visible by default, OR
- Hidden initially (appears after user interaction)

**Recommendation**: **Visible by default** (simpler UX, no hidden features)

#### Q1.2 - Link Limits
**Decision**: PENDING - Clarify total links

**Recommendation**:
- LinkedIn (optional) + Portfolio (optional) = 2 default slots
- Up to 3 additional custom links
- **Total: Max 5 links**

#### Q1.3 - Custom Link Labels
**Decision**: PENDING

**Recommendation**:
- "Custom" dropdown option allows user to type their own label
- Max length: 20 characters
- Allowed characters: Letters, numbers, spaces, hyphens only
- Sanitize on save

---

### **2. Professional Summary**

#### ✅ Q3.1 - Current Location (FOUND)
**Location**: `client/src/components/resume-builder/steps/AdditionalStep.tsx` (Line 16-32)

Currently in **Step 7 (Additional)**, mixed with:
- Professional Summary (required)
- Certifications (optional)
- Extracurricular Activities (optional)

**Action Required**:
1. Extract Professional Summary → new Step 6 (after Skills)
2. Add "Generate Summary" button with AI integration
3. Keep Certifications + Extracurriculars in Step 7

---

#### ✅ Q3.2 - Generate Summary Button Behavior
**Decision**: **Option B - Only populate if empty**

```typescript
const handleGenerateSummary = async () => {
  // Check if user already has text
  if (data.professionalSummary.trim().length > 0) {
    // Show confirmation: "Replace existing summary?"
    const confirmed = window.confirm('Replace existing summary?');
    if (!confirmed) return;
  }

  // Generate and populate
  const summary = await generateSummaryAPI(data);
  onChange({ ...data, professionalSummary: summary });
};
```

**Rationale**: Prevents accidental data loss, safer UX

---

#### ✅ Q3.3 - Required Field Validation
**Decision**: **Character count (min 100 chars)**

```typescript
const validateSummary = (summary: string): boolean => {
  return summary.trim().length >= 100;
};
```

**Rationale**:
- Simpler to implement than sentence parsing
- More flexible than word count
- 100 chars ≈ 2-3 short sentences

**Error message**: "Professional summary must be at least 100 characters (currently: XX)"

---

#### ✅ Q3.4 - Fields for Summary Generation
**Your Answer**: "fields that are gonna be used to generate Skills"
*(Note: This question was about SUMMARY generation, not skills. Assuming you meant summary)*

**Decision**: Send these fields to AI for summary generation:

```typescript
interface SummaryGenerationInput {
  // Personal
  targetRole: string;           // e.g., "Junior Data Analyst"
  targetIndustry: string;       // e.g., "Technology"

  // Education (condensed)
  education: {
    degree: string;             // e.g., "Bachelor of Science"
    field: string;              // e.g., "Computer Science"
    institution: string;        // e.g., "MIT"
  }[];

  // Experience (condensed)
  experience: {
    position: string;           // e.g., "Data Analysis Intern"
    company: string;            // e.g., "Google"
  }[];

  // Skills (top 5 from each category)
  topSkills: string[];          // e.g., ["Python", "SQL", "Tableau", "R", "Excel"]

  // Projects (names only)
  projectNames: string[];       // e.g., ["Sales Dashboard", "COVID-19 Analysis"]
}
```

**Rationale**:
- Enough context for quality summary
- Avoids sending full bullet points (reduces API cost)
- ~200-300 tokens vs 1000+ tokens (75% cost reduction)

---

### **3. Template System**

#### ✅ Q4.1 - Template Selection Timing
**Your Answer**: "When user tries to create resume from scratch"

**Decision**: User selects template **before starting the form**

**Implementation**:
1. User clicks "Build Resume from Scratch" on dashboard
2. Show template selection screen:
   ```
   ┌─────────────────────────────────────────┐
   │  Choose Your Template                   │
   │                                         │
   │  ┌──────────┐     ┌──────────┐         │
   │  │  [IMG]   │     │  [IMG]   │         │
   │  │   ATS    │     │  Simple  │         │
   │  │ Template │     │ Template │         │
   │  └──────────┘     └──────────┘         │
   │      [✓]              [ ]               │
   │                                         │
   │          [Start Building →]             │
   └─────────────────────────────────────────┘
   ```
3. User clicks "Start Building" → goes to Step 1 with template pre-selected
4. Template shown in preview panel from the start

**Routing**:
```
/build/new → Template Selection Screen
/build/new?template=ats → Skip selection, start with ATS
/build/:resumeId → Load saved template from database
```

---

#### ✅ Q4.2 - Template Switching Behavior
**Your Answer**: "A) Instantly update preview with same data"

**Decision**: **Instant preview update, no confirmation**

```typescript
const handleTemplateChange = (newTemplateId: 'ats' | 'simple') => {
  setActiveTemplate(newTemplateId);
  setHasUnsavedChanges(true); // Mark as unsaved
  // Preview re-renders automatically via React state
};
```

**Rationale**: Smooth UX, encourages exploration

---

#### ✅ Q4.3 - Template Persistence
**Your Answer**: "User can only save the final output"

**⚠️ CLARIFICATION NEEDED**: This question was about template persistence across sessions. Your answer suggests no draft save feature, but the spec explicitly includes "Save Draft" button.

**Two interpretations:**

**Option A** - No draft save feature at all:
- Remove "Save Draft" button from spec
- User must complete all 7 steps to save
- Template choice lost if browser closes

**Option B** - Draft save exists, but export requires completion:
- "Save Draft" button saves progress + template choice
- User can reload and continue editing
- "Export PDF" only works on complete resumes

**Which do you mean?** (Assuming **Option B** for now)

**Decision (assuming Option B)**:
- Save draft at any time (saves template choice)
- Export requires completion

---

#### ✅ Q4.4 - Template Thumbnails
**Your Answer**: "You pick"

**Decision**: **Option A - Static screenshots (manually created)**

**Action**:
1. Manually create two template previews:
   - `client/public/assets/templates/ats-preview.png` (400×520px)
   - `client/public/assets/templates/simple-preview.png` (400×520px)
2. Use screenshot tool or Figma export
3. Show sample resume with dummy data

**Rationale**: Faster for MVP, no Puppeteer setup needed

---

### **4. Live Preview - Two-Panel Layout**

#### ✅ Q5.4 - Mobile Tab Scroll Position
**Your Answer**: "A) Remember scroll position"

**Decision**: **Preserve scroll position when switching tabs**

```typescript
const [editScrollPosition, setEditScrollPosition] = useState(0);
const [previewScrollPosition, setPreviewScrollPosition] = useState(0);

const handleTabSwitch = (newTab: 'edit' | 'preview') => {
  if (currentTab === 'edit') {
    setEditScrollPosition(window.scrollY);
  } else {
    setPreviewScrollPosition(window.scrollY);
  }

  setCurrentTab(newTab);

  // Restore scroll after tab renders
  setTimeout(() => {
    window.scrollTo(0, newTab === 'edit' ? editScrollPosition : previewScrollPosition);
  }, 0);
};
```

**Rationale**: Better UX, user doesn't lose context

---

#### ✅ Q5.5 - Preview Loading State
**Your Answer**: "C) Spinner"

**Decision**: **Simple centered spinner**

```typescript
{isLoading ? (
  <div className="flex h-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
  </div>
) : (
  <ResumePreview data={formData} templateId={activeTemplate} />
)}
```

**Rationale**: Simple, clear, no complexity

---

### **5. Step Order & Navigation**

#### ✅ Q8.1 - Step Structure
**Your Answer**: "Option A - Still 7 steps"

**Decision**: **7 steps total**

1. **Personal Information** (merge Basic Info + Target Role)
   - Name, email, phone, location
   - Target role, target industry
   - LinkedIn, portfolio, additional links

2. **Education**
   - Degrees, institutions, GPA, coursework

3. **Experience**
   - Internships, part-time, volunteer work

4. **Projects**
   - Personal/academic projects

5. **Skills** (AI pre-populated)
   - Technical skills (categorized)
   - Soft skills
   - Languages

6. **Professional Summary** (AI-assisted)
   - 2-3 sentence summary

7. **Additional Information**
   - Certifications (optional)
   - Extracurricular activities (optional)

**File Changes**:
```
steps/BasicInfoStep.tsx + steps/TargetRoleStep.tsx
  → steps/PersonalInfoStep.tsx (NEW, merge both)

steps/AdditionalStep.tsx
  → Extract summary → steps/SummaryStep.tsx (NEW)
  → Rename to keep certifications/extracurriculars
```

---

#### ✅ Q8.2 - Step Validation on Next
**Your Answer**: "A) Block navigation if current step invalid"

**Decision**: **"Next" button disabled if current step has validation errors**

```typescript
const [validationErrors, setValidationErrors] = useState<string[]>([]);

const handleNext = () => {
  const errors = validateCurrentStep(currentStep, formData);

  if (errors.length > 0) {
    setValidationErrors(errors);
    return; // Block navigation
  }

  setValidationErrors([]);
  setCurrentStep(s => s + 1);
};

// In render
<button
  onClick={handleNext}
  disabled={validationErrors.length > 0}
  className={validationErrors.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}
>
  Next →
</button>

{validationErrors.length > 0 && (
  <div className="mt-4 rounded-md bg-red-50 p-4">
    <ul className="list-disc pl-5 text-sm text-red-700">
      {validationErrors.map(err => <li key={err}>{err}</li>)}
    </ul>
  </div>
)}
```

**Rationale**: Forces users to complete required fields, improves data quality

---

#### ✅ Q8.3 - Step Tabs Direct Navigation
**Your Answer**: "Jump to any step anytime"

**Decision**: **Allow jumping to any step via tabs, even if previous steps incomplete**

**⚠️ POTENTIAL CONFLICT with Q8.2**

**Resolution**:
- **"Next" button**: Blocked if current step invalid ❌
- **Step tabs**: Always allow jumping ✅
- **Visual indicators**: Show ⚠️ on incomplete steps

```typescript
<StepIndicator
  steps={STEP_LABELS}
  currentStep={currentStep}
  completedSteps={[0, 1, 2]} // Steps that pass validation
  onStepClick={(stepIndex) => setCurrentStep(stepIndex)} // Always allowed
/>
```

**Rationale**:
- Power users can navigate freely
- "Next" button guides beginners
- Visual warnings prevent accidental submission

---

### **6. Mobile Responsiveness**

#### ✅ Q9.1 - Mobile Template Selector
**Your Answer**: "C) In settings icon/menu"

**Decision**: **Template selector in hamburger menu on mobile**

```typescript
// Mobile header
<header className="lg:hidden">
  <button onClick={() => setMenuOpen(true)}>
    <MenuIcon /> {/* Hamburger icon */}
  </button>
</header>

// Slide-out menu
<MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
  <div className="p-4">
    <h3 className="font-semibold">Template</h3>
    <TemplateSelector
      activeTemplate={activeTemplate}
      onChange={setActiveTemplate}
    />
  </div>
  <div className="border-t p-4">
    <button onClick={handleSaveDraft}>Save Draft</button>
  </div>
</MobileMenu>
```

**Rationale**: Saves screen space, groups settings together

---

#### ✅ Q9.2 - Mobile Export Buttons
**Your Answer**: "In hamburger menu"

**Decision**: **Export buttons in hamburger menu**

```typescript
<MobileMenu isOpen={menuOpen}>
  {/* ... template selector ... */}

  <div className="border-t p-4">
    <h3 className="font-semibold mb-2">Export</h3>
    <button onClick={handleExportPDF}>
      Export as PDF
    </button>
    <button onClick={handleExportMarkdown}>
      Export as Markdown
    </button>
  </div>
</MobileMenu>
```

**Rationale**: Consistent location, doesn't clutter main UI

---

### **7. Performance & Optimization**

#### ✅ Q10.1 - AI Caching Strategy
**Your Answer**: "Database cache"

**Decision**: **PostgreSQL-based caching**

**Implementation**:
```sql
CREATE TABLE ai_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'skills:Junior Data Analyst:Technology'
  cache_value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON ai_cache(expires_at);
```

**Service logic**:
```typescript
async function generateSkillsWithCache(targetRole: string, targetIndustry: string) {
  const cacheKey = `skills:${targetRole}:${targetIndustry}`;

  // Check cache
  const cached = await pool.query(
    'SELECT cache_value FROM ai_cache WHERE cache_key = $1 AND expires_at > NOW()',
    [cacheKey]
  );

  if (cached.rows.length > 0) {
    return cached.rows[0].cache_value;
  }

  // Generate with OpenAI
  const skills = await generateSkillsFromAI(targetRole, targetIndustry);

  // Store in cache
  await pool.query(
    'INSERT INTO ai_cache (cache_key, cache_value) VALUES ($1, $2) ON CONFLICT (cache_key) DO UPDATE SET cache_value = $2, created_at = NOW()',
    [cacheKey, JSON.stringify(skills)]
  );

  return skills;
}
```

**Rationale**:
- Persistent across server restarts
- No additional infrastructure (Redis)
- 30-day expiration keeps data fresh
- Significant cost savings for common roles

---

#### ✅ Q10.2 - Preview Rendering Optimization
**Your Answer**: "D) Keep it simple for MVP"

**Decision**: **Basic React.memo, no complex optimization**

```typescript
export const ResumePreview = React.memo<ResumePreviewProps>(({ data, templateId }) => {
  return (
    <div className="preview-container">
      <TemplateRenderer data={data} templateId={templateId} />
    </div>
  );
});
```

**Rationale**: Premature optimization is evil, optimize when we see actual performance issues

---

#### ✅ Q10.3 - Template Thumbnail Loading
**Your Answer**: "I don't know, you pick"

**Decision**: **Lazy load (on-demand)**

```typescript
<img
  src={template.thumbnail}
  alt={template.name}
  loading="lazy" // Native browser lazy loading
  className="w-full h-auto"
/>
```

**Rationale**:
- Only 2 thumbnails (small payload)
- Native lazy loading is simple
- No noticeable performance difference

---

### **8. Testing Strategy**

#### ✅ Q11.1 - Test Coverage Target
**Your Answer**: "B) 100% critical paths, lower for UI"

**Decision**: **Focus on critical business logic**

**Coverage targets**:
- ✅ **100% coverage**: AI services, controllers, API endpoints
- ✅ **80%+ coverage**: Form validation logic, data transformations
- ✅ **50%+ coverage**: UI components (interaction tests, not visual)
- ⚠️ **No coverage requirements**: Styling, pure presentational components

**Critical paths to test**:
1. AI skills generation (with mocked OpenAI)
2. AI summary generation (with mocked OpenAI)
3. Save draft (database persistence)
4. Load draft (database retrieval)
5. Export PDF (with mocked Puppeteer)
6. Export Markdown (string generation)
7. Form validation (all 7 steps)

---

#### ✅ Q11.2 - E2E Testing
**Your Answer**: "A) Skip E2E"

**Decision**: **No E2E tests for MVP**

**Rationale**:
- Unit + integration tests provide sufficient coverage
- E2E setup (Playwright/Cypress) adds complexity
- Can add post-MVP if needed

---

#### ✅ Q11.3 - Snapshot Testing
**Your Answer**: "I don't know, pick for me"

**Decision**: **C) Snapshot test section components only**

**Implementation**:
```typescript
// Test each section renderer in isolation
describe('EducationSection', () => {
  it('renders education entries correctly', () => {
    const { container } = render(
      <EducationSection
        education={mockEducation}
        template={TEMPLATES.ats}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
```

**What to snapshot**:
- ✅ ContactSection
- ✅ SummarySection
- ✅ EducationSection
- ✅ ExperienceSection
- ✅ ProjectsSection
- ✅ SkillsSection
- ✅ AdditionalSection

**What NOT to snapshot**:
- ❌ Full ResumePreview (too large, brittle)
- ❌ Form steps (test behavior, not markup)

**Rationale**:
- Catches visual regressions in templates
- Smaller snapshots = more maintainable
- Easy to review snapshot diffs

---

### **9. Database & Data Migration**

#### ✅ Q12.1 - Backward Compatibility
**Your Answer**: "Yes, C) Ignore old data"

**Decision**: **Old resumes stay in old format, new live preview feature uses new format**

**Implementation**:
```typescript
// When loading resume for editing
function loadResumeForEdit(resumeId: string) {
  const resume = await getResume(resumeId);

  // Check if resume was created with new live preview feature
  if (resume.created_with_live_preview) {
    // Load with new structure (nested skills, etc.)
    return resume.form_data;
  } else {
    // Old resume - can only view, not edit with live preview
    return { error: 'This resume was created with the old builder and cannot be edited with live preview.' };
  }
}
```

**Database tracking**:
```sql
ALTER TABLE resumes ADD COLUMN created_with_live_preview BOOLEAN DEFAULT FALSE;
```

**Rationale**:
- Clean separation of old/new features
- No complex data migration
- Old resumes still viewable/exportable

---

#### ✅ Q12.2 - Resume Status Tracking
**Your Answer**: "You pick"

**Decision**: **Add status column to track resume lifecycle**

**Migration**:
```sql
-- New migration file: 005_add_resume_status.ts
ALTER TABLE resumes
  ADD COLUMN status VARCHAR(20) DEFAULT 'draft',
  ADD COLUMN created_with_live_preview BOOLEAN DEFAULT FALSE;

-- Create index for common queries
CREATE INDEX idx_resumes_status ON resumes(status);
CREATE INDEX idx_resumes_live_preview ON resumes(created_with_live_preview);

-- Update existing resumes
UPDATE resumes
SET status = CASE
  WHEN match_percentage IS NOT NULL THEN 'complete'
  ELSE 'draft'
END,
created_with_live_preview = FALSE;
```

**Status values**:
- `'draft'` - In progress, not submitted
- `'complete'` - All fields filled, ready for export
- `'exported'` - User has downloaded PDF/Markdown (optional tracking)

**Usage**:
```typescript
// Save draft
await pool.query(
  'UPDATE resumes SET status = $1, updated_at = NOW() WHERE id = $2',
  ['draft', resumeId]
);

// Mark complete after successful generation
await pool.query(
  'UPDATE resumes SET status = $1, updated_at = NOW() WHERE id = $2',
  ['complete', resumeId]
);

// Dashboard - show only drafts
const drafts = await pool.query(
  'SELECT * FROM resumes WHERE user_id = $1 AND status = $2 AND created_with_live_preview = TRUE',
  [userId, 'draft']
);
```

**Rationale**:
- Clear intent vs NULL checks
- Easy filtering in dashboard
- Can add more statuses later ('archived', 'deleted', etc.)

---

### **10. Error Handling & Edge Cases**

#### ✅ Q13.1 - AI API Failures
**Your Answer**: "A) Show error, let user continue manually"

**Decision**: **Graceful degradation - show error, allow manual input**

**Skills generation failure**:
```typescript
const handleSkillsGeneration = async () => {
  setIsGenerating(true);
  setError(null);

  try {
    const skills = await generateSkillsAPI(data.targetRole, data.targetIndustry);
    onChange({ ...data, skills });
  } catch (err) {
    setError('Failed to generate skills. Please add them manually.');
    // Keep form editable, show empty skill inputs
    onChange({
      ...data,
      skills: {
        technical: [{ category: '', items: [] }],
        soft: [],
        languages: [{ language: '', proficiency: 'basic' }]
      }
    });
  } finally {
    setIsGenerating(false);
  }
};
```

**Summary generation failure**:
```typescript
const handleSummaryGeneration = async () => {
  setIsGenerating(true);
  setError(null);

  try {
    const summary = await generateSummaryAPI(formData);
    onChange({ ...data, professionalSummary: summary });
  } catch (err) {
    setError('Failed to generate summary. Please write it manually.');
    // Keep textarea editable, show placeholder
  } finally {
    setIsGenerating(false);
  }
};
```

**UI**:
```typescript
{error && (
  <div className="mb-4 rounded-md bg-yellow-50 p-4">
    <div className="flex">
      <AlertTriangle className="h-5 w-5 text-yellow-400" />
      <p className="ml-3 text-sm text-yellow-700">{error}</p>
    </div>
  </div>
)}
```

**Rationale**:
- Never block user progress
- AI is a helper, not a requirement
- Clear error messages guide user

---

#### ✅ Q13.2 - Concurrent Editing
**Your Answer**: "A) Allow (last save wins)"

**Decision**: **No conflict detection, last save wins**

**Implementation**:
```typescript
// Simple save logic, no locks or version checking
async function saveDraft(resumeId: string, formData: ResumeFormData) {
  await pool.query(
    `UPDATE resumes
     SET updated_at = NOW()
     WHERE id = $1`,
    [resumeId]
  );

  await pool.query(
    `UPDATE resume_data
     SET form_data = $1
     WHERE resume_id = $2`,
    [JSON.stringify(formData), resumeId]
  );

  return { success: true, message: 'Draft saved' };
}
```

**Rationale**:
- Edge case (unlikely users edit same resume in 2 tabs)
- Conflict detection adds complexity
- Can add optimistic locking post-MVP if needed

---

## 📊 **Summary of Decisions**

### ✅ **Finalized (28 decisions)**
- Professional Summary location and flow
- Summary generation behavior (AI-assisted)
- Template selection and switching
- Mobile UI organization
- Navigation validation rules
- AI caching strategy (PostgreSQL)
- Testing strategy (no E2E, focused coverage)
- Database status tracking
- Error handling approach

### ⚠️ **Needs Clarification (2 items)**
1. **Q4.3** - Draft save feature: Include or exclude?
2. **Q1.1-Q1.3** - Additional links UI details

### 🔄 **Recommended Next Steps**
1. Confirm Q4.3 clarification (draft save feature)
2. Finalize additional links UI decisions
3. Create database migration for status column
4. Begin Phase 1 implementation (Template System)

---

**Ready to proceed once clarifications are confirmed!** 🚀
