# **Product Requirements Document (PRD)**
## **AI Resume Builder for Junior Roles**

### **1. Product Overview**

**Product Name:** AI Resume Builder (tentative)

**Target Users:** Fresh graduates seeking junior-level positions

**Core Value Proposition:** An AI-powered web application that helps fresh graduates build ATS-optimized resumes from scratch or improve existing ones, with intelligent job market analysis showing their chances of landing desired junior roles.

**Tech Stack:**
- **Frontend:** React, TypeScript, TailwindCSS, React Router
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL
- **Authentication:** Passport.js (session-based, stored in PostgreSQL)
- **AI:** OpenAI API (GPT-4o-mini)
- **File Storage:** Local filesystem (MVP)
- **PDF Generation:** Puppeteer

***

### **2. MVP Scope (Must-Have Features)**

#### **2.1 User Authentication**
- Email/password registration and login
- Session-based authentication using Passport.js
- Sessions stored in PostgreSQL
- Basic profile management

#### **2.2 Resume Building Flow - Path A: Upload Existing Resume**
**User Journey:**
1. User logs in
2. Uploads PDF resume
3. System extracts text from PDF
4. User selects target job role (free text input)
5. User selects target country (required) and city (optional)
6. AI analyzes resume and provides:
   - Match percentage for landing that job
   - Keyword analysis (overlap with typical junior role requirements)
   - Improvement suggestions (rewrite suggestions, missing sections, better action verbs, quantified achievements)
7. User views improved resume suggestions
8. User exports improved resume (PDF + Markdown)

#### **2.3 Resume Building Flow - Path B: Build from Scratch**
**User Journey:**
1. User logs in
2. Selects "Build Resume from Scratch"
3. Completes multi-step form (see Section 3 for detailed questions)
4. AI generates tailored resume for target junior role
5. User selects target country (required) and city (optional)
6. AI provides match percentage and analysis
7. User exports resume (PDF + Markdown)

#### **2.4 AI Features**
- **Resume Analysis:** ATS compatibility check, keyword matching against job role requirements
- **Improvement Suggestions:** Section-by-section recommendations using GPT-4o-mini
- **Match Percentage Calculation:** OpenAI-based analysis of resume vs. target role + location (AI-estimated, not real-time job data)
- **Resume Generation:** Create complete resume from user-provided information with ATS-compliant formatting

#### **2.5 Export Functionality**
- Generate PDF using Puppeteer with ATS-compliant template
- Generate Markdown version
- Both formats styled professionally
- One-time generation (no editing after export in MVP)

#### **2.6 Storage**
- Store one resume per user (current/latest version only)
- Store uploaded PDF files locally
- Store parsed resume text in PostgreSQL
- Store user preferences (target role, country, city)

***

### **3. Multi-Step Resume Builder Form**

**Step 1: Basic Information**
- Full Name
- Email (pre-filled from account)
- Phone Number
- LinkedIn Profile URL (optional)
- Portfolio/GitHub URL (optional)
- City and Country

**Step 2: Target Role**
- Target junior position (free text)
- Target country for jobs (dropdown)
- Target city (optional, free text)

**Step 3: Education**
- Degree type
- Major/Field of Study
- University Name
- Graduation Date
- GPA (if > 3.0)
- Relevant Coursework (3-5 courses)
- Academic Honors/Awards (optional)

**Step 4: Professional Experience**
- Internships (Company, Role, Duration, 3-5 key responsibilities)
- Part-time jobs/Freelance (Company, Role, Duration, Responsibilities)
- Volunteer work (Organization, Role, Duration, Contributions)

**Step 5: Projects**
- 2-3 Projects with:
  - Project Name
  - Description
  - Technologies Used
  - Your Role
  - GitHub/Demo Link (optional)

**Step 6: Skills**
- Technical Skills (free text, comma-separated)
- Soft Skills (multi-select from predefined list)
- Languages (with proficiency levels)

**Step 7: Additional Information**
- Certifications (optional)
- Extracurricular Activities/Leadership (optional)
- Professional Summary (2-3 sentences)

**UI/UX Requirements:**
- Progress indicator showing current step
- Ability to go back and edit previous steps
- Save draft functionality
- Clear validation messages
- Responsive design for mobile/desktop

***

### **4. ATS Compatibility System**

**What is ATS?**
Applicant Tracking Systems parse and filter resumes before human recruiters see them. ATS-friendly resumes must follow specific formatting rules.

**ATS Compliance Checks:**

1. **Format Requirements:**
   - Simple, clean layout (no tables, text boxes, complex columns)
   - Standard fonts (Arial, Calibri, Times New Roman)
   - No images, graphics, or charts
   - Standard section headings (Contact, Summary, Education, Experience, Skills)

2. **Content Requirements:**
   - Standard section names (Education, Experience, Skills, not creative variations)
   - Keywords from job description present
   - Consistent date formatting
   - Clear job titles and company names

3. **Scoring Algorithm (Out of 100):**
   - **Format Compliance (40 points):** Check template uses ATS-safe structure
   - **Keyword Match (40 points):** Calculate overlap between resume and common junior role keywords for selected position
   - **Section Completeness (20 points):** Verify presence of Contact, Summary, Education, Experience, Skills sections

**Implementation:**
- Create ATS-compliant Puppeteer templates
- Use OpenAI to extract keywords from user's target role
- Compare resume content against extracted keywords
- Flag formatting issues if detected

***

### **5. Job Match Percentage Feature**

**MVP Implementation (Option A):**
- Use OpenAI GPT-4o-mini to analyze:
  - User's resume content
  - Target role (user-inputted)
  - Target location (country + optional city)
- AI provides estimated match percentage based on:
  - Keyword overlap
  - Required skills for that junior role
  - Location-specific requirements (if known in training data)
  - Experience level appropriateness

**Output includes:**
- **Match Percentage:** XX% chance of getting an interview
- **Strengths:** What makes this resume strong (3-5 points)
- **Weaknesses:** What's missing or needs improvement (3-5 points)
- **Disclaimer:** "This is an AI-estimated analysis based on typical market trends, not real-time job data."

**Future Enhancement (Option B - Post-MVP):**
- Integrate Adzuna Job API for real-time job market statistics
- Pull actual job postings for role + location
- Calculate match based on real job descriptions
- Show: number of active openings, average salary, top required skills frequency

***

### **6. Database Schema**

**Users Table:**
```
- id (primary key)
- email (unique)
- password_hash
- created_at
- updated_at
```

**Sessions Table (Passport.js):**
```
- sid (primary key)
- sess (JSON)
- expire (timestamp)
```

**Resumes Table:**
```
- id (primary key)
- user_id (foreign key → users.id)
- file_path (for uploaded PDF)
- parsed_text (extracted text)
- target_role
- target_country
- target_city (nullable)
- match_percentage
- ai_analysis (JSON: strengths, weaknesses, suggestions)
- ats_score
- created_at
- updated_at
```

**Resume_Data Table (for built-from-scratch resumes):**
```
- id (primary key)
- resume_id (foreign key → resumes.id)
- form_data (JSON: all form responses)
- created_at
```

***

### **7. Technical Architecture**

**Frontend Structure:**
```
/src
  /components
    /auth (Login, Register)
    /dashboard (User homepage)
    /resume-upload (Path A components)
    /resume-builder (Path B multi-step form)
    /analysis (Match % results, suggestions)
    /export (PDF/Markdown generation UI)
    /shared (Header, Footer, Loading, etc.)
  /pages
  /hooks
  /utils
  /types (TypeScript interfaces)
```

**Backend Structure:**
```
/src
  /routes
    /auth
    /resume
    /analysis
    /export
  /controllers
  /middleware (auth, file upload, error handling)
  /services
    /ai (OpenAI integration)
    /pdf (Puppeteer PDF generation)
    /parser (PDF text extraction)
    /ats (ATS scoring logic)
  /models (PostgreSQL schemas)
  /utils
  /config
```

**API Endpoints:**

*Authentication:*
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

*Resume Management:*
- `POST /api/resume/upload` - Upload PDF
- `POST /api/resume/parse` - Extract text from PDF
- `POST /api/resume/build` - Create from scratch (form submission)
- `GET /api/resume/:id` - Get resume data
- `DELETE /api/resume/:id` - Delete resume

*AI Analysis:*
- `POST /api/analysis/match` - Calculate match percentage
- `POST /api/analysis/improve` - Get improvement suggestions
- `POST /api/analysis/ats-score` - Get ATS compatibility score

*Export:*
- `POST /api/export/pdf` - Generate PDF
- `POST /api/export/markdown` - Generate Markdown

***

### **8. AI Integration Details**

**OpenAI API Usage (GPT-4o-mini):**

1. **Resume Parsing & Structure:**
   - Extract sections from uploaded resume
   - Identify contact info, experience, education, skills

2. **Improvement Suggestions:**
   ```
   Prompt: "Analyze this resume for a [target role] position. Provide specific improvements for: 
   - Bullet points (use stronger action verbs, quantify achievements)
   - Missing sections
   - Keyword optimization for ATS
   - Formatting issues"
   ```

3. **Match Percentage Calculation:**
   ```
   Prompt: "A fresh graduate with this resume is applying for [target role] in [country, city]. 
   Analyze their qualifications and estimate their interview chances as a percentage. 
   Consider: required skills, experience level, education, location job market for junior roles.
   Provide: percentage, 3-5 strengths, 3-5 weaknesses."
   ```

4. **Resume Generation from Scratch:**
   ```
   Prompt: "Generate an ATS-optimized resume for a [target role] based on this information: [form data].
   Format with clear sections: Summary, Education, Experience, Projects, Skills.
   Use strong action verbs and quantify achievements where possible."
   ```

**Cost Estimation:**
- Average tokens per analysis: ~2000 tokens
- GPT-4o-mini pricing: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Cost per user session: < $0.01

***

### **9. PDF Template Requirements (ATS-Compliant)**

**Design Specifications:**
- **Font:** Arial 11pt (body), 14pt (name), 12pt (headings)
- **Margins:** 0.75 inches all sides
- **Sections (in order):**
  1. Contact Information (centered at top)
  2. Professional Summary (2-3 sentences)
  3. Education
  4. Experience (Internships, Jobs, Volunteer)
  5. Projects
  6. Skills (Technical, Soft, Languages)
  7. Certifications (if applicable)
  8. Extracurricular Activities (if applicable)

**Formatting Rules:**
- No headers/footers
- No text boxes or tables for content
- Simple bullet points (- )
- Consistent date format: MM/YYYY
- Clear section dividers (horizontal lines or bold headings)
- Single column layout

**Markdown Template:**
- Standard Markdown formatting
- Export as `.md` file
- User can copy-paste into any Markdown editor

***

### **10. Nice-to-Have Features (Post-MVP)**

These features are NOT in MVP but should be documented for future development:

1. **Real-Time Job Market Integration (Option B)**
   - Integrate Adzuna API
   - Show active job openings for target role + location
   - Display salary ranges, top skills in demand
   - More accurate match percentage based on real job descriptions

2. **AI Resume Rating Dashboard**
   - Visual score breakdown (pie chart, bar graph)
   - Section-by-section scores (Education: 85%, Experience: 60%, etc.)
   - Comparison to average junior candidate

3. **Multiple Resume Versions**
   - Allow users to save different versions for different roles
   - Compare versions side-by-side

4. **Resume Editing**
   - Edit exported resume within the app
   - Regenerate PDF after changes

5. **Cover Letter Generator**
   - AI-generated cover letters tailored to job description

6. **Job Application Tracker**
   - Track where resume was submitted
   - Follow-up reminders

7. **Resume Templates**
   - Multiple design options (still ATS-compliant)
   - Industry-specific templates

***

### **11. Success Metrics**

**MVP Success Criteria:**
- Users can successfully upload OR build resume from scratch
- AI provides match percentage within 30 seconds
- PDF export is ATS-compliant (passes format checks)
- 80%+ of generated resumes score above 60/100 on ATS compatibility

**Future Metrics to Track:**
- User signup rate
- Resume completion rate (Path A vs Path B)
- Average match percentage
- Export rate (how many users export after analysis)
- User retention (return visits)

***

### **12. Development Phases**

**Phase 1: Core Infrastructure (Weeks 1-2)**
- Set up Node.js + Express + TypeScript backend
- Set up React + TypeScript + TailwindCSS frontend
- PostgreSQL database schema
- Passport.js authentication
- Basic routing and API structure

**Phase 2: Resume Upload Flow - Path A (Weeks 3-4)**
- PDF upload functionality
- PDF text extraction
- OpenAI resume parsing
- Basic analysis UI

**Phase 3: Resume Builder Form - Path B (Weeks 5-6)**
- Multi-step form with validation
- Form data storage
- Progress saving

**Phase 4: AI Analysis Engine (Week 7)**
- Match percentage calculation
- ATS scoring algorithm
- Improvement suggestions generator
- Keyword analysis

**Phase 5: Export Functionality (Week 8)**
- Puppeteer PDF generation
- ATS-compliant template design
- Markdown export
- Download functionality

**Phase 6: Polish & Testing (Week 9)**
- UI/UX refinements
- Error handling
- Testing across different resume types
- Performance optimization

**Phase 7: Deployment (Week 10)**
- Production deployment
- Documentation
- User testing

***

### **13. Constraints & Assumptions**

**Technical Constraints:**
- Local file storage (not scalable long-term)
- Session-based auth (consider JWT for future mobile apps)
- One resume per user (limits flexibility)
- OpenAI API rate limits (500 requests/minute on free tier)

**Assumptions:**
- Users have resumes in PDF format or are willing to build from scratch
- Fresh graduates understand what "junior role" means
- Users can accurately describe their target role
- OpenAI training data is sufficient for market analysis (without real-time APIs)

**Risks:**
- OpenAI API costs could scale with users
- PDF parsing accuracy varies by resume format
- Local storage not suitable for production scale
- Session storage in PostgreSQL may impact performance at scale

***

### **14. Future Monetization Strategy**

(Not for MVP, but for planning purposes)

**Free Tier:**
- 1 resume analysis per month
- Basic export (PDF only)
- AI-estimated match percentage

**Premium Tier ($9.99/month):**
- Unlimited resume analyses
- Multiple resume versions
- Real-time job market data (Adzuna API)
- Cover letter generator
- Priority AI processing
- Advanced templates

***

## **END OF PRD**