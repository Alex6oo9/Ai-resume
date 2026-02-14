# **JuniorResume - Live Preview Feature Guide (REVISED)**
## **Production-Ready Implementation Specification**

***

## **1. Feature Overview**

**Product Name:** JuniorResume  
**Target Users:** Fresh graduates seeking junior-level positions across **all industries** (Software Engineering, Data Analysis, Marketing, Sales, Finance, HR, Design, etc.)

**Core Experience:**
- Users fill out a multi-section resume form (left panel)
- Live preview updates instantly as they type (right panel)
- Choose between two ATS-compliant templates
- Navigate with Next/Back buttons through form sections
- Manually save progress when desired
- Export final resume as PDF when complete

***

## **2. UI/UX Layout**

### **2.1 Desktop Layout (Primary Experience)**

```
┌─────────────────────────────────────────────────────────┐
│  Header: [Logo] [Template Selector] [Save Button]       │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│   LEFT PANEL         │      RIGHT PANEL                 │
│   (Form)             │      (Live Preview)              │
│                      │                                  │
│  [Section Tabs]      │   ┌──────────────────────────┐  │
│  • Personal Info     │   │                          │  │
│  • Education         │   │   RESUME PREVIEW         │  │
│  • Experience        │   │   (Selected Template)    │  │
│  • Projects          │   │                          │  │
│  • Skills            │   │   Updates as you type    │  │
│  • Summary           │   │                          │  │
│  • Additional        │   └──────────────────────────┘  │
│                      │                                  │
│  [Form Fields]       │   [Export PDF] [Export MD]       │
│                      │                                  │
│  [← Back] [Next →]   │                                  │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**Left Panel (40% width):**
- Section navigation (tabs or vertical menu)
- Active section form fields
- Back/Next navigation buttons
- Form validation messages inline
- Manual "Save Draft" button in header

**Right Panel (60% width):**
- Live resume preview (scrollable)
- Sticky header with template selector
- Export actions at bottom
- Auto-scrolls to relevant section as user edits

### **2.2 Mobile Layout (Responsive)**

```
┌─────────────────────────────────┐
│  [Edit] Tab  |  [Preview] Tab   │
├─────────────────────────────────┤
│                                 │
│  Active Tab Content             │
│                                 │
│  Edit: Form fields              │
│  Preview: Resume render         │
│                                 │
│  [Template Selector - Sticky]   │
│  [Save Draft]                   │
│  [← Back] [Next →]              │
└─────────────────────────────────┘
```

***

## **3. Resume Data Structure (Industry-Agnostic)**

### **3.1 Central Resume State Object**

```typescript
interface ResumeData {
  // Metadata
  id: string;
  userId: string;
  templateId: 'ats' | 'simple';
  targetRole: string; // Asked in Personal Info section
  targetIndustry: string; // Derived from targetRole or separate field
  lastModified: Date;
  
  // Personal Information
  basics: {
    name: string;
    email: string;
    phone: string;
    location: {
      city: string;
      country: string;
    };
    // Default links (always shown)
    linkedIn?: string;
    portfolio?: string;
    
    // Additional links (user can add)
    additionalLinks: Array<{
      id: string;
      label: string; // e.g., "GitHub", "Behance", "Medium", "Website"
      url: string;
    }>;
  };
  
  // Professional Summary (moved to Step 6, after Skills)
  summary: string; // 2-3 sentences tailored to target role
  
  // Education (list for multiple degrees)
  education: Array<{
    id: string;
    degree: string;
    field: string;
    institution: string;
    location: string;
    graduationDate: string; // MM/YYYY format
    gpa?: number;
    relevantCoursework: string[];
    honors?: string[];
  }>;
  
  // Professional Experience
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer';
    industry?: string;
    highlights: string[];
  }>;
  
  // Projects
  projects: Array<{
    id: string;
    name: string;
    description: string;
    role: string;
    startDate?: string;
    endDate?: string;
    technologies?: string[]; // For tech roles
    tools?: string[]; // For non-tech roles
    outcomes?: string;
    link?: string;
  }>;
  
  // Skills (AI pre-populated based on targetRole)
  skills: {
    technical: Array<{
      category: string;
      items: string[];
    }>;
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
    }>;
  };
  
  // Certifications (optional)
  certifications?: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
    link?: string;
  }>;
  
  // Extracurricular Activities (optional)
  activities?: Array<{
    id: string;
    organization: string;
    role: string;
    startDate?: string;
    endDate?: string;
    description: string;
  }>;
}
```

***

## **4. Form Structure and Flow (REVISED ORDER)**

### **4.1 Section Navigation**

**7 Core Sections (New Order):**

1. **Personal Information** (includes Target Role & Target Industry)
2. **Education**
3. **Experience**
4. **Projects**
5. **Skills** (AI pre-populated)
6. **Professional Summary** (moved here so AI can use context)
7. **Additional Information**

**Progress Indicator:**
```
[1•Personal] → [2•Education] → [3•Experience] → [4•Projects] → [5•Skills] → [6•Summary] → [7•Additional]
```

Show completion status: "4 of 7 sections complete"

***

### **4.2 Section-Specific Forms**

#### **Section 1: Personal Information** ⭐ **REVISED**

**Fields:**

**Basic Contact (Required):**
- Full Name* (text input)
- Email* (email validation)
- Phone* (phone format validation)
- City* (text input)
- Country* (dropdown with search)

**Target Position (Required):**
- Target Role* (text input with autocomplete suggestions)
  - Examples: "Junior Software Engineer", "Marketing Coordinator", "Data Analyst", "Sales Associate", "Financial Analyst", "HR Assistant", "Graphic Designer"
  - Placeholder: "e.g., Junior Data Analyst"
- Target Industry* (dropdown)
  - Options: Technology, Marketing, Sales, Finance, HR, Design, Healthcare, Education, Engineering, Consulting, Retail, Hospitality, Other
  - Auto-suggest based on targetRole if possible

**Professional Links:**
- LinkedIn Profile (URL validation, optional)
  - Placeholder: "https://linkedin.com/in/yourname"
- Portfolio/Website (URL validation, optional)
  - Placeholder: "https://yourportfolio.com"

**Additional Links (Dynamic):**
- Button: **"+ Add Another Link"** (initially hidden, appears after user clicks)
- When clicked, shows:
  - Link Label dropdown: [GitHub, Behance, Medium, Dribbble, YouTube, Custom]
  - URL input field
  - Remove button (X)
- Allow up to 3 additional links

**UI Example:**
```
─────────────────────────────────────
LinkedIn Profile
[https://linkedin.com/in/yourname   ]

Portfolio/Website
[https://yourportfolio.com          ]

[+ Add Another Link]
─────────────────────────────────────
```

**After clicking "Add Another Link":**
```
─────────────────────────────────────
LinkedIn Profile
[https://linkedin.com/in/yourname   ]

Portfolio/Website
[https://yourportfolio.com          ]

Additional Link 1
[GitHub ▼] [https://github.com/... ] [X]

[+ Add Another Link]
─────────────────────────────────────
```

**Validation:**
- All required fields must be filled before proceeding
- Email format validation
- Phone number format guide
- URL validation for all link fields

***

#### **Section 2: Education**

**List Management:**
- "Add Education" button
- Edit/Remove for each entry
- Support multiple entries (most recent first)

**Per Entry Fields:**
- Degree Type* (dropdown: Bachelor of Science, Bachelor of Arts, Associate, etc.)
- Field of Study* (text input)
- Institution Name* (text input)
- Location (City, Country)
- Graduation Date* (month/year picker)
- GPA (number input, show only if ≥ 3.0 on 4.0 scale)
- Relevant Coursework (multi-input, 3-5 courses)
- Academic Honors (multi-input, optional)

**Validation:**
- At least 1 education entry required
- Graduation date validation

***

#### **Section 3: Experience**

**List Management:**
- "Add Experience" button with type selector
- Edit/Remove for each entry
- Sort by date (most recent first)

**Per Entry Fields:**
- Experience Type* (badge: Internship, Part-time, Full-time, Freelance, Volunteer)
- Company/Organization* (text input)
- Position Title* (text input)
- Location (City, Country)
- Start Date* (month/year picker)
- End Date* (month/year picker or "Present" checkbox)
- Industry (dropdown, optional)
- Responsibilities & Achievements* (bullet point list)
  - Add/remove bullet points
  - Each bullet: textarea with 150 char limit
  - Guidance: "Start with action verbs (Led, Developed, Analyzed). Include metrics."

**Smart Features:**
- Action verb suggestions based on industry [uppl](https://uppl.ai/ats-resume-examples/)
- Bullet point quality hints

**Validation:**
- At least 1 experience entry required
- At least 1 bullet point per experience

***

#### **Section 4: Projects**

**List Management:**
- "Add Project" button
- Edit/Remove for each entry
- Minimum 1 project recommended

**Per Entry Fields:**
- Project Name* (text input)
- Short Description* (textarea, 1-2 sentences, 200 char limit)
- Your Role* (text input)
- Start Date (month/year, optional)
- End Date (month/year, optional)
- Technologies/Tools Used (multi-input)
  - Label dynamically: "Technologies" for tech roles, "Tools Used" for others
- Key Outcomes (textarea, optional)
- Project Link (URL, optional)

**Industry-Specific Guidance:**
- Tech: GitHub repos, demos
- Marketing: Campaign portfolios
- Data: Kaggle, dashboards
- Design: Behance, Dribbble
- Sales: Competition results
- Finance: Analysis reports

**Validation:**
- Recommended 1+ projects, not strictly required

***

#### **Section 5: Skills** ⭐ **AI PRE-POPULATED**

**AI Generation Flow:**

1. **On Section Load:**
   - Check if `targetRole` exists from Section 1
   - If yes, automatically call OpenAI API:
     ```
     Prompt: "Generate a comprehensive skills list for a fresh graduate 
     applying for [targetRole] in [targetIndustry]. Include:
     - 3-4 technical skill categories with 3-5 specific skills each
     - 8-10 relevant soft skills
     - Suggest common languages for this role
     
     Format as JSON:
     {
       "technical": [
         {"category": "Category Name", "items": ["skill1", "skill2", ...]},
         ...
       ],
       "soft": ["skill1", "skill2", ...],
       "languages": [
         {"language": "English", "proficiency": "fluent"},
         ...
       ]
     }"
     ```

2. **Display Pre-Populated Skills:**
   - Show loading state: "Generating skills for [targetRole]..."
   - Once loaded, populate form with AI-generated skills
   - Show message: "✨ We've pre-filled skills for [targetRole]. Edit or add more below."

3. **User Can Edit:**
   - Add/remove skills from any category
   - Add new categories
   - Modify proficiency levels
   - Add languages

**Three Subsections:**

**5a. Technical Skills*** (AI Pre-populated)
- Dynamic categories based on `targetRole` and `targetIndustry`
- Display as editable chips/tags
- "Add Category" button
- Multi-input for each category

**Example for "Junior Data Analyst":**
```
Statistical Tools
[Python] [R] [SPSS] [+ Add]

Data Visualization
[Tableau] [Power BI] [matplotlib] [+ Add]

Query Languages
[SQL] [+ Add]

Spreadsheet Software
[Excel] [Google Sheets] [+ Add]

[+ Add New Category]
```

**Example for "Marketing Coordinator":**
```
Digital Marketing
[Google Analytics] [SEMrush] [HubSpot] [Hootsuite] [+ Add]

Content Creation
[Canva] [Adobe Photoshop] [Figma] [+ Add]

Social Media Management
[Facebook Ads Manager] [LinkedIn Marketing] [Buffer] [+ Add]

Email Marketing
[Mailchimp] [Constant Contact] [+ Add]

[+ Add New Category]
```

**5b. Soft Skills*** (AI Pre-populated)
- Multi-select chips/tags
- Pre-populated by AI based on targetRole
- Common options: Communication, Teamwork, Problem-solving, Leadership, Time Management, Adaptability, Critical Thinking, Attention to Detail, Customer Service, Presentation Skills
- "Add Custom Skill" button

**Example:**
```
[Communication] [Teamwork] [Problem-solving] [Analytical Thinking] 
[Time Management] [Attention to Detail] [Adaptability] [Leadership]

[+ Add Custom Skill]
```

**5c. Languages*** (AI Pre-populated)
- Add multiple languages
- For each: Language name + Proficiency dropdown
- Proficiency: Native, Fluent, Professional Working, Intermediate, Basic
- Pre-populated with common languages for target country

**Example:**
```
English        [Fluent ▼]        [X Remove]
Thai          [Native ▼]        [X Remove]
[+ Add Language]
```

**Validation:**
- At least 3 technical skills required
- At least 3 soft skills required
- At least 1 language required

**AI API Cost Optimization:**
- Cache common targetRole responses
- Use gpt-4o-mini (cheapest model)
- Estimated cost: ~$0.001 per generation

***

#### **Section 6: Professional Summary** ⭐ **MOVED HERE**

**Rationale for Moving Summary to Step 6:**
- By this point, user has filled Education, Experience, Projects, Skills
- AI can generate better summary with full context
- User can review their content before writing summary

**Fields:**
- Summary* (textarea, 2-5 sentences, character limit 500)

**AI Assistance:**
- **"Generate Summary" Button** (uses OpenAI)
- Prompt:
  ```
  "Write a professional summary for a fresh graduate applying for [targetRole] in [targetIndustry].
  
  Context:
  - Education: [degree] in [field] from [institution]
  - Experience: [list position titles]
  - Key Skills: [top 5 technical skills]
  - Projects: [project names]
  
  Write 2-3 sentences highlighting education, relevant experience, key skills, and career goals.
  Make it ATS-friendly and professional."
  ```

**Manual Editing:**
- User can edit AI-generated summary
- Character counter (500 max)
- Real-time preview update

**Guidance:**
- Show example: "Recent [degree] graduate with experience in [key skill]. Demonstrated ability to [achievement] through [project/internship]. Seeking [targetRole] position to leverage [skills] in [industry]."

**Validation:**
- Summary required (2-3 sentences minimum)

***

#### **Section 7: Additional Information** (Optional)

**Subsections:**

**Certifications:**
- Add/remove entries
- Fields: Name, Issuing Organization, Date, Credential ID (optional), Link (optional)

**Extracurricular Activities:**
- Add/remove entries
- Fields: Organization, Role, Duration, Description

**Awards & Honors:**
- Multi-input list

**Validation:**
- All fields optional

***

## **5. Template System**

### **5.1 Template Data Storage**

**Template Structure in Database:**

```typescript
interface Template {
  id: 'ats' | 'simple';
  name: string;
  description: string;
  thumbnail: string; // Path to preview image for selection UI
  isPremium: boolean; // For future expansion
  styles: {
    // Font settings
    fontFamily: string;
    fontSize: {
      body: string;
      heading: string;
      name: string;
    };
    // Spacing
    lineHeight: string;
    sectionSpacing: string;
    // Colors (ATS-safe only)
    textColor: string;
    accentColor?: string; // Only for Simple template
    // Layout
    margins: string;
    bulletStyle: string;
  };
  sections: {
    order: string[]; // Array of section names in order
    headingFormat: 'uppercase' | 'titlecase' | 'lowercase';
    showSectionDividers: boolean;
    dividerStyle?: 'line' | 'spacing';
  };
  preview: {
    // Sample data for template preview modal
    sampleResume: Partial<ResumeData>;
  };
}
```

**Template Storage Options:**

**Option 1: Database Storage (Recommended for Scalability)**
```sql
CREATE TABLE templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  thumbnail VARCHAR(255), -- Path to S3/local file
  is_premium BOOLEAN DEFAULT FALSE,
  styles JSONB NOT NULL, -- Stores styles object
  sections JSONB NOT NULL, -- Stores sections config
  preview_data JSONB, -- Sample resume for preview
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Seed with MVP Templates:**
```sql
INSERT INTO templates (id, name, description, thumbnail, styles, sections) VALUES
('ats', 'ATS Template', 'Strict ATS compliance, maximum parsability', '/templates/ats-preview.png', 
  '{"fontFamily": "Arial", "fontSize": {"body": "11pt", "heading": "12pt", "name": "14pt"}, ...}',
  '{"order": ["contact", "summary", "education", "experience", "projects", "skills", "certifications"], ...}'
),
('simple', 'Simple Template', 'Clean and modern, still ATS-safe', '/templates/simple-preview.png',
  '{"fontFamily": "Calibri", "fontSize": {"body": "11pt", "heading": "12pt", "name": "16pt"}, ...}',
  '{"order": ["contact", "summary", "education", "experience", "projects", "skills", "certifications"], ...}'
);
```

**Option 2: Code-Based Templates (Simpler for MVP)**
- Store template configurations in code as constants
- Faster to develop, no database schema needed
- Harder to add new templates without code changes

```typescript
// /src/templates/templateConfig.ts
export const TEMPLATES: Record<string, Template> = {
  ats: {
    id: 'ats',
    name: 'ATS Template',
    description: 'Maximum compatibility with Applicant Tracking Systems',
    thumbnail: '/assets/templates/ats-preview.png',
    isPremium: false,
    styles: {
      fontFamily: 'Arial, sans-serif',
      fontSize: {
        body: '11pt',
        heading: '12pt',
        name: '14pt',
      },
      lineHeight: '1.15',
      sectionSpacing: '6pt',
      textColor: '#000000',
      margins: '0.75in',
      bulletStyle: 'disc',
    },
    sections: {
      order: ['contact', 'summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'activities'],
      headingFormat: 'uppercase',
      showSectionDividers: false,
    },
    preview: {
      sampleResume: {
        basics: {
          name: 'Jane Doe',
          email: 'jane.doe@email.com',
          phone: '+1-555-123-4567',
          location: { city: 'San Francisco', country: 'USA' },
          linkedIn: 'linkedin.com/in/janedoe',
        },
        summary: 'Recent Computer Science graduate with experience in full-stack development...',
        // ... more sample data
      },
    },
  },
  simple: {
    id: 'simple',
    name: 'Simple Template',
    description: 'Clean, modern design with subtle styling',
    thumbnail: '/assets/templates/simple-preview.png',
    isPremium: false,
    styles: {
      fontFamily: 'Calibri, sans-serif',
      fontSize: {
        body: '11pt',
        heading: '12pt',
        name: '16pt',
      },
      lineHeight: '1.25',
      sectionSpacing: '8pt',
      textColor: '#000000',
      accentColor: '#4A4A4A',
      margins: '0.75in',
      bulletStyle: 'square',
    },
    sections: {
      order: ['contact', 'summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'activities'],
      headingFormat: 'titlecase',
      showSectionDividers: true,
      dividerStyle: 'line',
    },
    preview: {
      sampleResume: {
        // Same sample data as ATS template
      },
    },
  },
};
```

**Recommendation for MVP:** Use **Option 2 (Code-Based)** for faster development. Migrate to database in v2 when adding more templates.

***

### **5.2 Template Preview for Selection**

**Template Selection UI:**

Show template options before or during form filling (e.g., in header):

```
┌─────────────────────────────────────────────┐
│  Select Template:                           │
│                                             │
│  ┌──────────┐     ┌──────────┐             │
│  │  [IMG]   │     │  [IMG]   │             │
│  │   ATS    │     │  Simple  │             │
│  │ Template │     │ Template │             │
│  └──────────┘     └──────────┘             │
│      [✓]              [ ]                   │
│                                             │
│  [Preview] button shows full-size sample   │
└─────────────────────────────────────────────┘
```

**Preview Modal:**
- Click "Preview" shows full-page modal with sample resume rendered in that template
- User can compare both templates side-by-side
- Select template and close modal

**Template Thumbnails:**
- Store static images: `/public/assets/templates/ats-preview.png`, `/simple-preview.png`
- Generate once during development using Puppeteer
- Dimensions: 400px width × 520px height (A4 aspect ratio)

**Generating Template Thumbnails (One-Time Setup):**
```typescript
// scripts/generateTemplateThumbnails.ts
import puppeteer from 'puppeteer';
import { TEMPLATES } from './src/templates/templateConfig';

async function generateThumbnail(templateId: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Render template with sample data
  const template = TEMPLATES[templateId];
  const html = renderTemplate(template.preview.sampleResume, templateId);
  
  await page.setContent(html);
  await page.setViewport({ width: 800, height: 1040 });
  await page.screenshot({
    path: `public/assets/templates/${templateId}-preview.png`,
    clip: { x: 0, y: 0, width: 400, height: 520 },
  });
  
  await browser.close();
}

// Run once for each template
generateThumbnail('ats');
generateThumbnail('simple');
```

***

### **5.3 Template Rendering Engine**

**Frontend Template Renderer:**

```typescript
// /src/components/ResumePreview/TemplateRenderer.tsx
import { TEMPLATES } from '@/templates/templateConfig';

interface TemplateRendererProps {
  data: ResumeData;
  templateId: 'ats' | 'simple';
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ data, templateId }) => {
  const template = TEMPLATES[templateId];
  
  return (
    <div 
      className="resume-template"
      style={{
        fontFamily: template.styles.fontFamily,
        fontSize: template.styles.fontSize.body,
        lineHeight: template.styles.lineHeight,
        padding: template.styles.margins,
        color: template.styles.textColor,
      }}
    >
      {template.sections.order.map(sectionKey => (
        <TemplateSection 
          key={sectionKey}
          sectionKey={sectionKey}
          data={data}
          template={template}
        />
      ))}
    </div>
  );
};

// Individual section renderer
const TemplateSection: React.FC<{sectionKey: string, data: ResumeData, template: Template}> = 
  ({ sectionKey, data, template }) => {
    
  switch(sectionKey) {
    case 'contact':
      return <ContactSection data={data.basics} template={template} />;
    case 'summary':
      return data.summary ? <SummarySection summary={data.summary} template={template} /> : null;
    case 'education':
      return <EducationSection education={data.education} template={template} />;
    // ... other sections
    default:
      return null;
  }
};
```

***

## **6. Live Preview Implementation**

### **6.1 Real-Time Rendering**

**Update Triggers:**
- Every keystroke in form inputs (debounced 300ms)
- Adding/removing list items (immediate)
- Template switching (immediate)
- Section navigation (immediate scroll)

**State Management:**
```typescript
const [resumeData, setResumeData] = useState<ResumeData>(initialState);
const [activeTemplate, setActiveTemplate] = useState<'ats' | 'simple'>('ats');
const [activeSection, setActiveSection] = useState<number>(0);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

// Preview component subscribes to state
<ResumePreview 
  data={resumeData} 
  template={activeTemplate} 
/>
```

**Performance:**
- Memoize preview: `React.memo(ResumePreview)`
- Debounce text inputs: 300ms delay

### **6.2 Section Visibility Rules**

**Always Show:**
- Personal Information
- Education
- Skills

**Show Only if Populated:**
- Summary
- Experience
- Projects
- Certifications
- Activities

**Placeholder Text:**
- Light gray (#999999) for empty fields
- "Add your first experience" prompts

***

## **7. Form Navigation and Validation**

### **7.1 Navigation Controls**

**Next Button:**
- Validates current section
- Shows errors if invalid
- Advances if valid
- Label: "Next: [Section Name]"

**Back Button:**
- No validation
- Always allows going back
- Label: "← Back"

**Section Tabs:**
- Direct jump to any section
- Show checkmarks on complete sections
- Show warnings on invalid sections

### **7.2 Validation Strategy**

**Required Fields by Section:**
1. **Personal:** Name, Email, Phone, City, Country, Target Role, Target Industry
2. **Education:** At least 1 entry (Degree, Field, Institution, Date)
3. **Experience:** At least 1 entry (Company, Position, Dates, 1+ bullets)
4. **Projects:** Recommended but not required
5. **Skills:** 3+ technical skills, 3+ soft skills, 1+ language
6. **Summary:** 2-3 sentences (min 100 chars)
7. **Additional:** All optional

**Validation Display:**
- Inline error messages
- Red border on invalid fields
- Error summary at section bottom

***

## **8. Manual Save System** ⭐ **NO AUTO-SAVE**

### **8.1 Save Button Behavior**

**Save Button Location:**
- Fixed in header (always visible)
- Label: "Save Draft"

**Save States:**
```
[Save Draft]           - Default (clickable)
[Saving...]           - Loading state (disabled)
[✓ Saved]             - Success state (3 seconds)
[⚠ Save Failed]       - Error state with retry
```

**Save Trigger:**
- User must manually click "Save Draft"
- No automatic saving
- Warn on page exit if unsaved changes exist

**Unsaved Changes Detection:**
```typescript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Track changes
useEffect(() => {
  setHasUnsavedChanges(true);
}, [resumeData]);

// Reset on save
const handleSave = async () => {
  await saveResumeDraft(resumeData);
  setHasUnsavedChanges(false);
};

// Warn before leaving
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

### **8.2 Save API**

**Endpoint:**
```
POST /api/resume/save
Body: { resumeData }
Response: { id, lastModified, message: "Draft saved successfully" }
```

**Database:**
- Update `resumes` table with full JSON data
- Update `lastModified` timestamp
- Return success/error

***

## **9. Export Functionality**

### **9.1 Export Flow**

**Pre-Export Validation:**
1. Click "Export PDF" or "Export Markdown"
2. Run validation check
3. If incomplete, show modal with missing sections
4. Offer "Continue anyway" or "Go back"
5. If complete, proceed to export

**Export Process:**
1. Frontend sends `POST /api/export/pdf` or `/markdown`
2. Payload: `{ resumeData, templateId }`
3. Backend generates file
4. Returns download URL or stream
5. Browser downloads file

**File Naming:**
```
FirstName_LastName_Resume.pdf
FirstName_LastName_Resume.md
```

### **9.2 PDF Export**

**Backend (Puppeteer):**
1. Receive `resumeData` and `templateId`
2. Load template config from `TEMPLATES` constant
3. Render HTML using same logic as frontend preview
4. Convert to PDF with Puppeteer
5. Return file

**PDF Settings:**
- Paper: US Letter (8.5" × 11")
- Margins: 0.75 inches
- No backgrounds (pure white)

### **9.3 Markdown Export**

**Template:**
```markdown
# [Name]
**Email:** [email] | **Phone:** [phone] | **Location:** [city, country]
**LinkedIn:** [url] | **Portfolio:** [url]

---

## Professional Summary
[Summary]

---

## Education
### [Degree] in [Field]
**[Institution]** | [Location] | [Date]
- GPA: [X.XX]
- Coursework: [courses]

---

## Experience
### [Position] | [Company]
**[Location]** | [Dates]
- [Bullet 1]
- [Bullet 2]

---

## Projects
### [Project Name]
**Role:** [role] | **Tools:** [tools]
[Description]
**Link:** [url]

---

## Skills
**[Category]:** skill1, skill2, skill3
**Soft Skills:** skill1, skill2
**Languages:** Language (Level)

---

## Certifications
- [Name] | [Issuer] | [Date]
```

***

## **10. ATS Compliance Guardrails**

### **10.1 Built-In Safety**

**Template Enforcement:**
- All templates hard-coded as ATS-safe [myperfectresume](https://www.myperfectresume.com/career-center/resumes/how-to/ats-friendly)
- No user customization
- No rich formatting
- Plain text only

**Input Restrictions:**
- No special characters
- No emojis (stripped)
- Date format enforced: MM/YYYY

**Section Standardization:**
- Fixed headings: "Education", "Experience", "Skills"
- Standard order
- Contact in body, not header/footer

### **10.2 ATS Warnings (Optional)**

Show warnings if:
- Summary missing
- No metrics in experience
- Dates inconsistent
- Skills too sparse (< 5 total)
- Resume > 2 pages

**Warning Display:**
```
⚠️ ATS Warning: No quantifiable metrics in experience
💡 Tip: Add numbers (e.g., "Increased by 25%")
```

***

## **11. Technical Implementation**

### **11.1 State Management**

```typescript
interface ResumeStore {
  resumeData: ResumeData;
  activeTemplate: 'ats' | 'simple';
  activeSection: number;
  hasUnsavedChanges: boolean;
  validationErrors: Record<string, string[]>;
  
  updateBasics: (basics: Partial<ResumeData['basics']>) => void;
  addAdditionalLink: () => void;
  removeAdditionalLink: (id: string) => void;
  updateAdditionalLink: (id: string, label: string, url: string) => void;
  
  generateSkillsFromRole: (targetRole: string, targetIndustry: string) => Promise<void>;
  
  // ... other actions
  
  saveDraft: () => Promise<void>;
  exportPDF: () => Promise<void>;
  exportMarkdown: () => Promise<void>;
}
```

### **11.2 AI Integration**

**Skills Generation:**
```typescript
const generateSkills = async (targetRole: string, targetIndustry: string) => {
  const response = await fetch('/api/ai/generate-skills', {
    method: 'POST',
    body: JSON.stringify({ targetRole, targetIndustry }),
  });
  
  const skills = await response.json();
  setResumeData({ ...resumeData, skills });
};
```

**API Endpoint:**
```
POST /api/ai/generate-skills
Body: { targetRole, targetIndustry }
Response: { technical: [...], soft: [...], languages: [...] }
```

**Backend (OpenAI):**
```typescript
const prompt = `Generate skills for a fresh graduate applying for ${targetRole} in ${targetIndustry}.

Return JSON:
{
  "technical": [
    {"category": "Category Name", "items": ["skill1", "skill2", "skill3"]},
    ...
  ],
  "soft": ["Communication", "Teamwork", ...],
  "languages": [
    {"language": "English", "proficiency": "fluent"}
  ]
}`;

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' },
});

return JSON.parse(completion.choices[0].message.content);
```

### **11.3 API Endpoints**

```
POST   /api/resume/save           - Manual save
GET    /api/resume/:id            - Load resume
POST   /api/ai/generate-skills    - Generate skills
POST   /api/ai/generate-summary   - Generate summary
POST   /api/export/pdf            - Export PDF
POST   /api/export/markdown       - Export Markdown
GET    /api/templates             - List templates (if DB-stored)
```

***

## **12. Implementation Checklist**

### **Phase 1: Core Structure (Week 1-2)**
- [ ] Two-panel layout (desktop)
- [ ] Mobile tab layout
- [ ] Central state management
- [ ] Template config system (code-based)
- [ ] Generate template thumbnails

### **Phase 2: Form Sections (Week 3-4)**
- [ ] Section 1: Personal Info with additional links
- [ ] Section 2: Education
- [ ] Section 3: Experience
- [ ] Section 4: Projects
- [ ] Section 5: Skills (empty form structure)
- [ ] Section 6: Summary (empty form structure)
- [ ] Section 7: Additional Info
- [ ] Section navigation (Next/Back)

### **Phase 3: AI Integration (Week 5)**
- [ ] Skills generation API
- [ ] Summary generation API
- [ ] Auto-populate skills on Section 5 load
- [ ] "Generate Summary" button in Section 6

### **Phase 4: Live Preview (Week 6)**
- [ ] ATS template renderer
- [ ] Simple template renderer
- [ ] Real-time preview updates
- [ ] Template switching
- [ ] Preview scroll sync

### **Phase 5: Save & Export (Week 7)**
- [ ] Manual save button
- [ ] Unsaved changes warning
- [ ] PDF export (Puppeteer)
- [ ] Markdown export
- [ ] Download functionality

### **Phase 6: Polish (Week 8)**
- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] ATS warnings
- [ ] Mobile responsiveness
- [ ] Cross-browser testing

***

## **13. Summary of Key Changes**

✅ **Additional Links:** LinkedIn + Portfolio default, user can add 3 more  
✅ **AI Skills Pre-Population:** Auto-generate skills based on targetRole  
✅ **Revised Section Order:** Personal (with targetRole) → Education → Experience → Projects → Skills → Summary → Additional  
✅ **Manual Save Only:** No auto-save, user clicks "Save Draft"  
✅ **Template Storage:** Code-based config with static thumbnails (database option documented for future)  
✅ **Removed Post-MVP Features:** Focus on core live preview functionality only

***

## **END OF REVISED FEATURE GUIDE**

This production-ready specification is now tailored exactly to **JuniorResume** with your requested changes. [careerkit](https://www.careerkit.me/blog/top-5-free-ats-resume-builders-to-boost-your-job-application)