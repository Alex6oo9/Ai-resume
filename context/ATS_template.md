Here is a complete implementation brief you can copy and paste directly into Claude Code.

***

# ATS-Friendly Resume Templates — Implementation Brief

## Project Context
Building two ATS-friendly resume templates for a resume builder app. Both templates must be production-ready React components that render correctly for both screen display and PDF export. The only difference between them is visual divider lines between sections.

***

## Core ATS Rules (Must Enforce in Both Templates)

1. **Single-column layout only** — no sidebars, no CSS grid multi-column, no flexbox rows for content
2. **No tables for layout** — `<table>` is strictly forbidden for structural use
3. **No `position: absolute` or `position: fixed`** anywhere in the template
4. **No custom web fonts** — only system-safe fonts: `Arial, Helvetica, sans-serif` or `Georgia, 'Times New Roman', serif`
5. **No image icons replacing text** — phone/email labels must be plain text or SVG beside text
6. **No skill bars, percentage circles, or visual rating meters** — skills are plain text only
7. **No photo/avatar**
8. **Standard section heading labels exactly as written:** `Professional Summary`, `Work Experience`, `Education`, `Skills`, `Certifications` — no creative renaming
9. **Contact info must be in a plain `<div>` at the top** — NOT inside HTML `<header>`, `<footer>`, or `<aside>` tags
10. **Bullet points use standard `<ul><li>`** — not custom symbols or decorative characters

***

## Data Schema (Props Interface)

Both templates receive the same `resumeData` prop:

```typescript
interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string; // "Present" if current
    bullets: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    honors?: string;
  }[];
  skills: {
    category: string; // e.g. "Languages", "Frameworks", "Tools"
    items: string[];
  }[];
  certifications?: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
}
```

***

## Template 1 — ATS Clean (No Lines)

**File:** `src/templates/ATSClean.tsx`
**Description:** Minimal, whitespace-driven separation. Sections are separated by margin/padding only. No borders, no dividers, no decorative elements. Safe for all ATS systems and plain-text copy-paste tests.

**Visual spec:**
- Background: `#ffffff`
- Name: `22px`, `font-weight: 700`, color `#111111`
- Contact line: `13px`, color `#444444`, items separated by ` | `
- Section headings `<h2>`: `13px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.08em`, color `#111111`, `margin-bottom: 8px`
- Job title `<h3>`: `13px`, `font-weight: 700`, color `#111111`
- Company + dates: `12px`, color `#555555`, on same line separated by ` | `
- Body text / bullets: `12px`, color `#222222`, `line-height: 1.5`
- Section spacing: `margin-bottom: 20px` between each `<section>`
- Page padding: `48px` top/bottom, `52px` left/right
- Font: `Arial, Helvetica, sans-serif`

```tsx
// src/templates/ATSClean.tsx

import React from 'react';
import { ResumeData } from '../types/resume';

interface Props {
  data: ResumeData;
}

const styles = {
  page: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    color: '#222222',
    backgroundColor: '#ffffff',
    padding: '48px 52px',
    maxWidth: '816px', // Letter width at 96dpi
    margin: '0 auto',
    lineHeight: '1.5',
  } as React.CSSProperties,

  name: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#111111',
    margin: '0 0 6px 0',
  } as React.CSSProperties,

  contactLine: {
    fontSize: '13px',
    color: '#444444',
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  section: {
    marginBottom: '20px',
  } as React.CSSProperties,

  sectionHeading: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#111111',
    margin: '0 0 8px 0',
  },

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2px',
  } as React.CSSProperties,

  jobTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#111111',
    margin: 0,
  } as React.CSSProperties,

  jobMeta: {
    fontSize: '12px',
    color: '#555555',
    margin: '0 0 6px 0',
  } as React.CSSProperties,

  bulletList: {
    margin: '4px 0 12px 0',
    paddingLeft: '18px',
  } as React.CSSProperties,

  bulletItem: {
    marginBottom: '3px',
  } as React.CSSProperties,

  skillRow: {
    marginBottom: '4px',
    fontSize: '12px',
  } as React.CSSProperties,

  skillCategory: {
    fontWeight: 700,
    color: '#111111',
  } as React.CSSProperties,
};

export const ATSClean: React.FC<Props> = ({ data }) => {
  const { contact, summary, experience, education, skills, certifications } = data;

  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean).join(' | ');

  return (
    <div style={styles.page}>

      {/* ── Contact Block ── */}
      <div>
        <h1 style={styles.name}>{contact.name}</h1>
        <p style={styles.contactLine}>{contactParts}</p>
      </div>

      {/* ── Professional Summary ── */}
      {summary && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Professional Summary</h2>
          <p style={{ margin: 0 }}>{summary}</p>
        </section>
      )}

      {/* ── Work Experience ── */}
      {experience.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Work Experience</h2>
          {experience.map((job) => (
            <div key={job.id} style={{ marginBottom: '12px' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <span style={{ fontSize: '12px', color: '#555555' }}>
                  {job.startDate} – {job.endDate}
                </span>
              </div>
              <p style={styles.jobMeta}>
                {job.company} | {job.location}
              </p>
              <ul style={styles.bulletList}>
                {job.bullets.map((bullet, i) => (
                  <li key={i} style={styles.bulletItem}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Education</h2>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{edu.degree}</h3>
                <span style={{ fontSize: '12px', color: '#555555' }}>
                  {edu.graduationDate}
                </span>
              </div>
              <p style={styles.jobMeta}>
                {edu.institution} | {edu.location}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                {edu.honors ? ` | ${edu.honors}` : ''}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Skills</h2>
          {skills.map((group, i) => (
            <p key={i} style={styles.skillRow}>
              <span style={styles.skillCategory}>{group.category}: </span>
              {group.items.join(', ')}
            </p>
          ))}
        </section>
      )}

      {/* ── Certifications ── */}
      {certifications && certifications.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '6px' }}>
              <div style={styles.jobHeader}>
                <span style={{ fontWeight: 700 }}>{cert.name}</span>
                <span style={{ fontSize: '12px', color: '#555555' }}>{cert.date}</span>
              </div>
              <p style={{ margin: 0, color: '#555555' }}>{cert.issuer}</p>
            </div>
          ))}
        </section>
      )}

    </div>
  );
};
```

***

## Template 2 — ATS Lined (With Section Dividers)

**File:** `src/templates/ATSLined.tsx`
**Description:** Same structure and ATS rules as ATSClean, but with a colored `border-bottom` under each `<h2>` section heading and a subtle accent color. The line is pure CSS — zero impact on ATS parsing.

**Differences from ATSClean:**
- Accent color: `#1a3557` (dark navy)
- Section headings have `border-bottom: 2px solid #1a3557` + `padding-bottom: 5px`
- Name color: `#1a3557`
- Job title color: `#1a3557`
- Everything else identical to ATSClean

```tsx
// src/templates/ATSLined.tsx

import React from 'react';
import { ResumeData } from '../types/resume';

interface Props {
  data: ResumeData;
}

const ACCENT = '#1a3557';

const styles = {
  page: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    color: '#222222',
    backgroundColor: '#ffffff',
    padding: '48px 52px',
    maxWidth: '816px',
    margin: '0 auto',
    lineHeight: '1.5',
  } as React.CSSProperties,

  name: {
    fontSize: '22px',
    fontWeight: 700,
    color: ACCENT,
    margin: '0 0 6px 0',
  } as React.CSSProperties,

  contactLine: {
    fontSize: '13px',
    color: '#444444',
    margin: '0 0 24px 0',
  } as React.CSSProperties,

  section: {
    marginBottom: '20px',
  } as React.CSSProperties,

  // ── KEY DIFFERENCE: border-bottom line on heading ──
  sectionHeading: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: ACCENT,
    margin: '0 0 8px 0',
    paddingBottom: '5px',
    borderBottom: `2px solid ${ACCENT}`,
  } as React.CSSProperties,

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2px',
  } as React.CSSProperties,

  jobTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: ACCENT,
    margin: 0,
  } as React.CSSProperties,

  jobMeta: {
    fontSize: '12px',
    color: '#555555',
    margin: '0 0 6px 0',
  } as React.CSSProperties,

  bulletList: {
    margin: '4px 0 12px 0',
    paddingLeft: '18px',
  } as React.CSSProperties,

  bulletItem: {
    marginBottom: '3px',
  } as React.CSSProperties,

  skillRow: {
    marginBottom: '4px',
    fontSize: '12px',
  } as React.CSSProperties,

  skillCategory: {
    fontWeight: 700,
    color: '#111111',
  } as React.CSSProperties,
};

export const ATSLined: React.FC<Props> = ({ data }) => {
  const { contact, summary, experience, education, skills, certifications } = data;

  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.website,
  ].filter(Boolean).join(' | ');

  return (
    <div style={styles.page}>

      {/* ── Contact Block ── */}
      <div>
        <h1 style={styles.name}>{contact.name}</h1>
        <p style={styles.contactLine}>{contactParts}</p>
      </div>

      {/* ── Professional Summary ── */}
      {summary && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Professional Summary</h2>
          <p style={{ margin: 0 }}>{summary}</p>
        </section>
      )}

      {/* ── Work Experience ── */}
      {experience.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Work Experience</h2>
          {experience.map((job) => (
            <div key={job.id} style={{ marginBottom: '12px' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{job.title}</h3>
                <span style={{ fontSize: '12px', color: '#555555' }}>
                  {job.startDate} – {job.endDate}
                </span>
              </div>
              <p style={styles.jobMeta}>
                {job.company} | {job.location}
              </p>
              <ul style={styles.bulletList}>
                {job.bullets.map((bullet, i) => (
                  <li key={i} style={styles.bulletItem}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ── Education ── */}
      {education.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Education</h2>
          {education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{edu.degree}</h3>
                <span style={{ fontSize: '12px', color: '#555555' }}>
                  {edu.graduationDate}
                </span>
              </div>
              <p style={styles.jobMeta}>
                {edu.institution} | {edu.location}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                {edu.honors ? ` | ${edu.honors}` : ''}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* ── Skills ── */}
      {skills.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Skills</h2>
          {skills.map((group, i) => (
            <p key={i} style={styles.skillRow}>
              <span style={styles.skillCategory}>{group.category}: </span>
              {group.items.join(', ')}
            </p>
          ))}
        </section>
      )}

      {/* ── Certifications ── */}
      {certifications && certifications.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Certifications</h2>
          {certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: '6px' }}>
              <div style={styles.jobHeader}>
                <span style={{ fontWeight: 700 }}>{cert.name}</span>
                <span style={{ fontSize: '12px', color: '#555555' }}>{cert.date}</span>
              </div>
              <p style={{ margin: 0, color: '#555555' }}>{cert.issuer}</p>
            </div>
          ))}
        </section>
      )}

    </div>
  );
};
```

***

## Type Definition File

**File:** `src/types/resume.ts`

```typescript
export interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    honors?: string;
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  certifications?: {
    id: string;
    name: string;
    issuer: string;
    date: string;
  }[];
}
```

***

## Mock Data for Testing

**File:** `src/templates/mockResumeData.ts`

```typescript
import { ResumeData } from '../types/resume';

export const mockResumeData: ResumeData = {
  contact: {
    name: 'Jordan Mitchell',
    email: 'jordan.mitchell@email.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/jordanmitchell',
    website: 'jordanmitchell.dev',
  },
  summary:
    'Full-stack software engineer with 6+ years of experience building scalable web applications using React, Node.js, and AWS. Proven track record of reducing infrastructure costs, improving system reliability, and leading cross-functional engineering teams in fast-paced startup environments.',
  experience: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'Cloudify Inc.',
      location: 'Austin, TX',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        'Architected a microservices platform on AWS (ECS, RDS, SQS) that reduced infrastructure costs by 38% and improved system uptime to 99.97%.',
        'Led a team of 5 engineers to deliver a real-time analytics dashboard used by 12,000+ daily active users.',
        'Reduced average API response time from 820ms to 210ms by implementing Redis caching and query optimization.',
        'Established CI/CD pipelines using GitHub Actions and Docker, cutting deployment time from 45 minutes to 6 minutes.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Software Engineer',
      company: 'NexaWeb Solutions',
      location: 'Remote',
      startDate: 'Mar 2019',
      endDate: 'Dec 2021',
      bullets: [
        'Built and maintained 15+ RESTful APIs using Node.js and Express, serving 2M+ monthly requests.',
        'Migrated legacy jQuery frontend to React, reducing bundle size by 52% and improving Lighthouse score from 61 to 94.',
        'Implemented automated unit and integration test suites (Jest, Cypress), increasing code coverage from 34% to 88%.',
      ],
    },
    {
      id: 'exp-3',
      title: 'Junior Frontend Developer',
      company: 'BrightPixel Agency',
      location: 'Dallas, TX',
      startDate: 'Jun 2017',
      endDate: 'Feb 2019',
      bullets: [
        'Developed responsive UI components for 20+ client websites using HTML5, CSS3, and JavaScript.',
        'Collaborated with design team to implement pixel-perfect mockups, reducing revision cycles by 30%.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Texas at Austin',
      location: 'Austin, TX',
      graduationDate: 'May 2017',
      gpa: '3.8',
      honors: 'Magna Cum Laude',
    },
  ],
  skills: [
    {
      category: 'Languages',
      items: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL', 'HTML5', 'CSS3'],
    },
    {
      category: 'Frameworks & Libraries',
      items: ['React', 'Next.js', 'Node.js', 'Express', 'Redux', 'Tailwind CSS'],
    },
    {
      category: 'Cloud & DevOps',
      items: ['Amazon Web Services (AWS)', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform'],
    },
    {
      category: 'Databases',
      items: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL'],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: 'Mar 2023',
    },
    {
      id: 'cert-2',
      name: 'Professional Scrum Master I (PSM I)',
      issuer: 'Scrum.org',
      date: 'Nov 2021',
    },
  ],
};
```

***

## Usage in Your App

```tsx
// Example: Template switcher
import { ATSClean } from './templates/ATSClean';
import { ATSLined } from './templates/ATSLined';
import { mockResumeData } from './templates/mockResumeData';

const TEMPLATES = {
  ats-clean: ATSClean,
  ats-lined: ATSLined,
};

export const ResumePreview = ({ templateId, data }) => {
  const Template = TEMPLATES[templateId];
  return <Template data={data ?? mockResumeData} />;
};
```

***

## ATS Validation Checklist for Claude Code

After generating both templates, verify:

- [ ] No `<table>` elements used anywhere for layout
- [ ] No `position: absolute` or `position: fixed` in any style
- [ ] Contact block uses a plain `<div>`, not `<header>`
- [ ] All section headings use exact standard labels
- [ ] Skills are plain text — no visual bars or grids
- [ ] Font is `Arial, Helvetica, sans-serif` — no Google Fonts
- [ ] **ATSLined only:** Line is `borderBottom` on `<h2>` style — not an `<img>`, not a text character, not a table row
- [ ] Copy-paste test: selecting all text in PDF preview reads top-to-bottom in logical order
- [ ] No photos or avatar elements