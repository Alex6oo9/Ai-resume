# Product Requirements Document (PRD)
## AI Resume Builder for Junior Roles

### 1. Product Overview

**Target Users:** Fresh graduates seeking junior-level positions

**Core Value Proposition:** An AI-powered web application that helps fresh graduates build ATS-optimized resumes from scratch or improve existing ones, with intelligent job market analysis showing their chances of landing desired junior roles.

**Tech Stack:**
- **Frontend:** React 18, TypeScript, TailwindCSS, Vite, React Router v6
- **Backend:** Node.js, Express 4, TypeScript
- **Database:** PostgreSQL
- **Authentication:** Passport.js (session-based, stored in PostgreSQL)
- **AI:** OpenAI API (GPT-4o-mini)
- **File Storage:** Local filesystem (MVP)
- **PDF Generation:** Puppeteer

---

### 2. Core Features (Built)

#### 2.1 User Authentication
- Email/password registration and login
- Session-based authentication using Passport.js
- Sessions stored in PostgreSQL

#### 2.2 Path A: Upload Existing Resume
1. User uploads PDF resume
2. System extracts text via pdf-parse v2
3. AI analyzes resume and provides:
   - Match percentage for landing that job
   - Strengths and weaknesses
   - Improvement suggestions
4. User exports improved resume (PDF + Markdown)

#### 2.3 Path B: Build from Scratch
1. User completes 7-step form (see Section 3)
2. AI generates tailored content (skills, summary, experience descriptions)
3. Live preview updates in real-time as user types
4. User selects a template
5. AI analysis provides match percentage
6. User exports resume (PDF + Markdown)

#### 2.4 AI Features
- **Resume Analysis:** ATS compatibility check, keyword matching
- **Improvement Suggestions:** Section-by-section recommendations
- **Match Percentage:** OpenAI-based analysis vs. target role + location
- **Skills Generation:** AI pre-populates skills based on role/experience
- **Summary Generation:** AI-generated professional summary
- **Experience Enhancement:** AI rewrites experience descriptions

#### 2.5 Template System
5 templates available (all free tier):
- **ATS Friendly** — Maximally ATS-safe, Arial, single-column
- **Simple** — Georgia serif, blue accents, clean dividers
- **Bold Accent** — Indigo header bar, photo support, for creative/design roles
- **Clean Tech** — Skills-first order, compact spacing, for developers
- **Executive Classic** — Serif typography, gold accents, for corporate roles

Template switching: live, real-time preview update. Template stored per-resume in DB.

Premium tier scaffold in place for future paid templates.

#### 2.6 Export Functionality
- Generate PDF using Puppeteer (template-aware in progress)
- Generate Markdown version
- Download directly from browser

---

### 3. Multi-Step Resume Builder Form (7 Steps)

**Step 1: Personal Information**
- Full Name, Email, Phone, City, Country
- LinkedIn Profile URL (optional)
- Portfolio/Website URL (optional)
- Up to 3 additional links (GitHub, Behance, Medium, Dribbble, YouTube, Custom)
- Profile Photo upload (optional, shown only on photo-supporting templates)
- Target Role, Target Industry, Target Country, Target City (optional)

**Step 2: Education**
- Degree Type, Major, University, Graduation Date
- GPA (optional), Relevant Coursework, Honors (optional)

**Step 3: Experience**
- Type: internship/part-time/full-time/freelance/volunteer
- Company, Role, Duration, Responsibilities
- AI enhancement available for experience descriptions

**Step 4: Projects** ( was moved inside Additional Information)
- Project Name, Description, Technologies, Role, Link (optional)

**Step 5: Skills**
- Technical Skills (categorized: category + items array)
- Soft Skills (multi-select from predefined list)
- Languages (with proficiency levels)
- AI auto-generation from role + experience context

**Step 6: Professional Summary**
- 2–3 sentence summary
- AI generation button

**Step 7: Additional Information**
- Certifications (optional)
- Extracurricular Activities (optional)

**UI Requirements:**
- Step indicator showing progress with click-to-navigate (completed steps stay clickable)
- All steps always mounted (CSS show/hide) — no data loss on back navigation
- Save draft / load draft functionality
- Real-time live preview panel alongside form

---

### 4. ATS Compatibility

**ATS Compliance Checks:**
1. **Format:** Simple layout, standard fonts, no images/tables/graphics
2. **Content:** Standard section names, keywords from job description, consistent date formats
3. **Scoring (0–100):** Format compliance (40pts) + keyword match (40pts) + section completeness (20pts)

---

### 5. Job Match Percentage

Uses GPT-4o-mini to analyze:
- Resume content vs. target role
- Target location (country + optional city)
- Experience level appropriateness

**Output:** Match percentage, 3–5 strengths, 3–5 weaknesses, disclaimer that it's AI-estimated.

---

### 6. Database Schema

**users** — `id`, `name`, `email`, `password` (bcrypt), `created_at`

**resumes** — `id`, `user_id`, `title`, `file_path` (nullable), `template_id` (slug), `created_at`, `updated_at`

**resume_data** — `id`, `resume_id` (CASCADE DELETE), `form_data` (JSONB), `analysis` (JSONB nullable)

**templates** — `id`, `name`, `display_name`, `description`, `category`, `thumbnail_url`, `supports_photo`, `is_ats_friendly`, `required_tier`, `sort_order`, `is_active`

**template_configurations** — `id`, `template_id`, `layout` (JSONB), `typography` (JSONB), `color_scheme` (JSONB), `sections` (JSONB)

**subscriptions** — `id`, `user_id`, `tier` (free/monthly/annual), `status`, `expires_at`

**resume_history** — `id`, `resume_id`, `user_id`, `change_type`, `previous_template_name`, `new_template_name`, `changed_fields`, `created_at`

**session** — PostgreSQL session store (managed by express-session)

---

### 7. Nice-to-Have Features (Post-MVP)

1. **Real-Time Job Market Integration** — Adzuna API for active job counts and salary ranges
2. **Visual Score Dashboard** — Pie/bar chart breakdown per section
3. **Multiple Resume Versions** — Save different versions per role
4. **Resume Editing** — Edit exported resume within the app
5. **Cover Letter Generator** — AI-generated cover letters
6. **Job Application Tracker** — Track submissions and follow-ups
7. **More Premium Templates** — Industry-specific paid designs
8. **Color Customization** — Let users adjust accent colors per template

---

### 8. Future Monetization

**Free Tier (current):**
- All 5 templates
- Unlimited resume builds
- AI analysis

**Premium Tier (planned, $9.99/month):**
- Exclusive premium templates
- Real-time job market data
- Cover letter generator
- Priority AI processing
- Color customization
