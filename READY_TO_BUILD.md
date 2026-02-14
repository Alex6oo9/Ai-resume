# 🚀 Live Preview Feature - Ready to Build

**Status**: ✅ All planning complete, ready for implementation
**Branch**: `live-preview-feature`
**Date**: 2026-02-14

---

## 📋 **Planning Documents**

| Document | Purpose | Status |
|----------|---------|--------|
| `Live_Preview_Feature.md` | Product specification | ✅ Complete |
| `IMPLEMENTATION_PLAN.md` | 10-phase development plan (6-8 weeks) | ✅ Complete |
| `REUSABILITY_ANALYSIS.md` | Code reuse analysis (65% reusable) | ✅ Complete |
| `DECISIONS.md` | 32 finalized design decisions | ✅ Complete |

---

## ✅ **What We're Building**

### **Core Features**

1. **Two-Panel Live Preview**
   - Desktop: Form (40%) + Live Preview (60%)
   - Mobile: Tab switcher (Edit | Preview)
   - Real-time updates (300ms debounce)

2. **7-Step Form Flow**
   - Step 1: Personal Information (merged Basic + Target Role)
   - Step 2: Education
   - Step 3: Experience
   - Step 4: Projects
   - Step 5: Skills (AI pre-populated)
   - Step 6: Professional Summary (AI-assisted)
   - Step 7: Additional Information

3. **AI-Powered Features**
   - Auto-generate skills based on target role/industry
   - Generate professional summary using full context
   - PostgreSQL caching (30-day expiration)

4. **Template System**
   - Two ATS-compliant templates (ATS, Simple)
   - Select before starting form
   - Instant template switching
   - Code-based config (no database)

5. **Draft Save System**
   - Manual "Save Draft" button (no auto-save)
   - Save at any step (don't need to complete)
   - Warn on page exit if unsaved changes
   - Persist template choice with draft

6. **Export Functionality**
   - PDF export (Puppeteer with template styles)
   - Markdown export
   - Validation before export (optional "Continue anyway")

---

## 🎯 **Key Design Decisions**

### **User Experience**
- ✅ Block "Next" button if current step invalid
- ✅ Allow direct tab jumping to any step
- ✅ Show warnings on incomplete steps
- ✅ Additional links: 5 max (LinkedIn, Portfolio, + 3 custom)
- ✅ Additional links button: Always visible
- ✅ Summary: AI-assisted, only populate if empty

### **Mobile Experience**
- ✅ Template selector in hamburger menu
- ✅ Export buttons in hamburger menu
- ✅ Remember scroll position when switching Edit/Preview tabs
- ✅ Simple spinner for loading states

### **Technical Architecture**
- ✅ AI caching: PostgreSQL with 30-day expiration
- ✅ Preview optimization: Basic React.memo (keep simple for MVP)
- ✅ Template thumbnails: Static screenshots (manually created)
- ✅ Image loading: Lazy load (native browser)
- ✅ Testing: 100% critical paths, skip E2E for MVP
- ✅ Snapshots: Section components only (not full preview)

### **Database**
- ✅ Add `status` column ('draft' | 'complete' | 'exported')
- ✅ Add `created_with_live_preview` boolean flag
- ✅ Add `template_id` column
- ✅ Old resumes stay in old format (no migration)

### **Error Handling**
- ✅ AI failures: Show error, allow manual input (graceful degradation)
- ✅ Concurrent editing: Allow (last save wins, no conflict detection)
- ✅ Export incomplete: Show modal, allow "Continue anyway"

---

## 📊 **Code Reusability**

| Category | Reusable | Action Needed |
|----------|----------|---------------|
| Backend Infrastructure | 95% | Add AI services, template config |
| Frontend Components | 60% | Modify 4 steps, add preview system |
| Database Schema | 100% | Add 3 columns (migration) |
| Data Types | 80% | Update skills structure |
| Testing Setup | 100% | Reuse existing patterns |

**Time Savings**: ~50 days vs building from scratch

---

## 🗂️ **File Structure Overview**

### **New Files to Create (15 files)**

#### Backend (5 files)
```
server/src/
├── services/
│   ├── ai/
│   │   ├── skillsGenerator.ts              [NEW]
│   │   └── summaryGenerator.ts             [NEW]
│   └── templates/
│       └── templateConfig.ts               [NEW]
├── controllers/
│   └── aiController.ts                     [NEW]
├── migrations/
│   └── 005_add_live_preview_columns.ts     [NEW]
```

#### Frontend (10 files)
```
client/src/
├── components/
│   ├── live-preview/                       [NEW FOLDER]
│   │   ├── ResumePreview.tsx
│   │   ├── TemplateRenderer.tsx
│   │   ├── TemplateSelector.tsx
│   │   └── sections/
│   │       ├── ContactSection.tsx
│   │       ├── SummarySection.tsx
│   │       ├── EducationSection.tsx
│   │       ├── ExperienceSection.tsx
│   │       ├── ProjectsSection.tsx
│   │       └── SkillsSection.tsx
│   └── resume-builder/
│       └── steps/
│           ├── PersonalInfoStep.tsx        [NEW - merge Basic+Target]
│           └── SummaryStep.tsx             [NEW - extract from Additional]
```

### **Files to Modify (8 files)**

#### Backend (3 files)
```
server/src/
├── controllers/
│   └── exportController.ts                 [MODIFY - add templateId]
└── services/export/
    ├── pdfGenerator.ts                     [MODIFY - use template]
    └── markdownGenerator.ts                [MODIFY - use template]
```

#### Frontend (5 files)
```
client/src/
├── types/
│   └── index.ts                            [MODIFY - skills structure]
├── pages/
│   └── ResumeBuilderPage.tsx               [MODIFY - two-panel layout]
└── components/resume-builder/steps/
    ├── SkillsStep.tsx                      [REWRITE - AI + chips UI]
    ├── ExperienceStep.tsx                  [MODIFY - add industry field]
    └── ProjectsStep.tsx                    [MODIFY - dynamic label]
```

---

## 📅 **Implementation Timeline**

### **Phase 1: Foundation (Week 1)** - 3-4 days
- Create template config system
- Update TypeScript types (skills, additional links)
- Create template thumbnails
- Database migration (status, template_id columns)

### **Phase 2: AI Services (Week 1-2)** - 3-4 days
- Skills generator service + tests
- Summary generator service + tests
- AI controller + routes
- PostgreSQL caching logic

### **Phase 3: Form Modifications (Week 2)** - 4-5 days
- Merge BasicInfoStep + TargetRoleStep → PersonalInfoStep
- Rewrite SkillsStep (AI integration, chips UI)
- Create SummaryStep (AI generation button)
- Update AdditionalStep (remove summary)
- Add additional links to PersonalInfoStep

### **Phase 4: Live Preview (Week 3)** - 5-6 days ⭐ CORE
- ResumePreview container
- TemplateRenderer
- 7 section renderers
- TemplateSelector component

### **Phase 5: Integration (Week 3-4)** - 3-4 days
- Two-panel layout in ResumeBuilderPage
- Template state management
- Real-time preview updates (debounced)
- Mobile responsive layout

### **Phase 6: Save/Load (Week 4)** - 2-3 days
- Draft save endpoint + tests
- Draft load endpoint + tests
- "Save Draft" button UI
- Unsaved changes warning

### **Phase 7: Export (Week 4-5)** - 2-3 days
- Update PDF generator (template support)
- Update Markdown generator (template support)
- Export validation flow
- Update export buttons

### **Phase 8: Section Order (Week 5)** - 1-2 days
- Reorder step labels
- Update validation logic
- Update StepIndicator

### **Phase 9: Polish (Week 5-6)** - 5-7 days
- Comprehensive testing (AI services, controllers, components)
- Error handling
- Loading states
- Form validation UI
- Accessibility

### **Phase 10: Mobile (Week 6)** - 3-4 days
- Mobile layout (tabs)
- Hamburger menu (template + export)
- Cross-browser testing
- Performance optimization

**Total**: 31-42 days (6-8 weeks)

---

## 🎯 **Starting Point: Phase 1**

### **First Tasks**

1. **Database Migration** (30 min)
   ```sql
   -- 005_add_live_preview_columns.ts
   ALTER TABLE resumes
     ADD COLUMN status VARCHAR(20) DEFAULT 'draft',
     ADD COLUMN template_id VARCHAR(50) DEFAULT 'ats',
     ADD COLUMN created_with_live_preview BOOLEAN DEFAULT FALSE;

   CREATE TABLE ai_cache (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     cache_key VARCHAR(255) UNIQUE NOT NULL,
     cache_value JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
   );
   ```

2. **Template Config** (2 hours)
   ```typescript
   // server/src/templates/templateConfig.ts
   export interface Template {
     id: 'ats' | 'simple';
     name: string;
     description: string;
     thumbnail: string;
     styles: { /* fonts, spacing, colors */ };
     sections: { order: string[]; headingFormat: string; };
   }

   export const TEMPLATES: Record<string, Template> = {
     ats: { /* config */ },
     simple: { /* config */ }
   };
   ```

3. **Update Types** (1 hour)
   ```typescript
   // client/src/types/index.ts
   interface ResumeFormData {
     // ... existing fields

     // NEW: Nested skills structure
     skills: {
       technical: Array<{ category: string; items: string[] }>;
       soft: string[];
       languages: Array<{ language: string; proficiency: string }>;
     };

     // NEW: Additional links
     basics: {
       // ... existing
       additionalLinks?: Array<{
         id: string;
         label: string;
         customLabel?: string;
         url: string;
       }>;
     };

     // NEW: Target industry
     targetIndustry: string;
   }
   ```

4. **Create Template Thumbnails** (1 hour)
   - Use Figma/Photoshop or screenshot tool
   - Create `client/public/assets/templates/ats-preview.png`
   - Create `client/public/assets/templates/simple-preview.png`
   - Size: 400×520px (A4 aspect ratio)

**Day 1 Total**: ~4.5 hours

---

## 🔄 **Development Workflow**

### **Branch Strategy**
```
main (production)
  └── live-preview-feature (current branch)
      └── phase-1-foundation (feature branch)
      └── phase-2-ai-services (feature branch)
      └── phase-3-form-updates (feature branch)
      └── ... etc
```

**Approach**:
- Create sub-branches for each phase
- Merge to `live-preview-feature` when phase complete
- Final PR: `live-preview-feature` → `main`

### **Testing as You Go**
- Write tests before implementation (TDD)
- Run tests after each file: `npm test`
- Backend: `cd server && npm test`
- Frontend: `cd client && npm test`

### **Commit Convention**
```
feat: Add skills generator AI service
test: Add tests for summary generation
refactor: Extract template config to separate file
fix: Handle empty skills array in preview
docs: Update DECISIONS.md with final choices
```

---

## 📚 **Reference Documents**

### **Product Spec**
- `Live_Preview_Feature.md` - Complete feature specification
- Section 4.2: Detailed form field requirements
- Section 5: Template system architecture
- Section 11: Technical implementation details

### **Implementation**
- `IMPLEMENTATION_PLAN.md` - 10 phases with detailed tasks
- `DECISIONS.md` - 32 finalized design decisions
- `REUSABILITY_ANALYSIS.md` - What to reuse vs build new

### **Existing Codebase**
- `CLAUDE.md` - Project overview and tech stack
- `PRD.md` - Original product requirements
- `MEMORY.md` - Project patterns and conventions

---

## ✅ **Pre-Implementation Checklist**

- [x] Specification reviewed and understood
- [x] All design decisions finalized
- [x] Code reusability analyzed
- [x] Implementation plan created (10 phases)
- [x] File structure mapped
- [x] Timeline estimated (6-8 weeks)
- [x] Starting tasks identified
- [ ] Database migration ready to run
- [ ] Template config structure defined
- [ ] Type definitions updated
- [ ] Template thumbnails created

---

## 🚀 **Ready to Start!**

**Next Command**: Create Phase 1 feature branch

```bash
git checkout -b phase-1-foundation
```

**First File to Create**: `server/src/migrations/005_add_live_preview_columns.ts`

---

**All blockers cleared. All decisions finalized. Let's build! 🎉**
