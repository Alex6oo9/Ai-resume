# Template Design Brief: ATS Clean

## 1. Template Overview

- **Template ID (DB slug):** `ats_clean`
- **Category:** ats
- **Target audience / design intent:** Job seekers targeting companies that use Applicant Tracking Systems (ATS). The template is intentionally plain and machine-readable — no columns, no colors, no decorative elements. Prioritizes correct parse order and keyword density over visual distinction. Designed to pass ATS parsing without any formatting artifacts.
- **Photo support:** No — ATS templates must never add photo support
- **Layout:** Single-column, full-width. All sections stack vertically.

---

## 2. Color Palette

| Role | Hex | Where used |
|---|---|---|
| Page background | `#ffffff` | Entire page |
| Primary text / body | `#222222` | Default body text (set on root `styles.page`) |
| Name (h1) | `#111111` | Full name heading |
| Section headings | `#111111` | All `<h2>` section headings |
| Job title / degree title | `#111111` | `<h3>` job/project/degree heading within section |
| Contact line | `#444444` | Pipe-separated contact string below name |
| Company / meta | `#555555` | Company name, degree institution, date spans |
| Date (right-aligned) | `#555555` | Date span in job header row |

**Note:** This template has zero color accent. Entire palette is black and grey. No hex value brighter than `#ffffff`.

---

## 3. Typography

- **Font family:** `Arial, Helvetica, sans-serif`
- **Base font size:** `12px`
- **Base line height:** `1.5`

| Element | Size | Weight | Transform | Color | Notes |
|---|---|---|---|---|---|
| Full name (h1) | `22px` | `700` | none | `#111111` | `margin: 0 0 6px 0` |
| Contact line (p) | `13px` | normal | none | `#444444` | `margin: 0 0 24px 0`; pipe `\|` separated |
| Section heading (h2) | `13px` | `700` | `uppercase` | `#111111` | `letterSpacing: 0.08em`, `margin: 0 0 8px 0`; **no border, no underline** |
| Job title / project name / degree (h3) | `13px` | `700` | none | `#111111` | `margin: 0` |
| Date span (right side of header row) | `12px` | normal | none | `#555555` | |
| Company / meta (p) | `12px` | normal | none | `#555555` | `margin: 0 0 6px 0` |
| Body / responsibilities | inherits `12px` | normal | none | `#222222` | via `.rich-content` |
| Skill category label | inherits `12px` | `700` | none | `#111111` | inline `<span>` |
| Skill items | `12px` | normal | none | `#222222` | bullet `•` prefix as text |

---

## 4. Layout & Dimensions

**Overall structure:**
Single-column block. No flex row, no sidebar.

```
┌──────────────────────────────────────────┐
│  padding: 48px 52px (all sides)          │
│                                          │
│  [Name]                                  │
│  [Contact line]                          │
│                                          │
│  PROFESSIONAL SUMMARY                    │
│  [body text]                             │
│                                          │
│  WORK EXPERIENCE                         │
│  [job items...]                          │
│                                          │
│  PROJECTS                                │
│  ...                                     │
│                                          │
│  EDUCATION                               │
│  ...                                     │
│                                          │
│  SKILLS                                  │
│  ...                                     │
│                                          │
│  CERTIFICATIONS                          │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Page padding:** `48px` top/bottom, `52px` left/right — applied to the root `<div>`.

**Section spacing:** `marginBottom: '20px'` on each `<section>`.

**Job header row layout:**
- `display: flex`, `justifyContent: space-between`, `alignItems: baseline`, `marginBottom: 2px`
- Left: `<h3>` job title
- Right: `<span>` date string (right-aligned, `12px #555555`)

**Skills layout:**
- Category label: `<span fontWeight: 700 color: #111111>`
- Items: indented `<div paddingLeft: 8px marginTop: 2px>`, each item as `<div>• item</div>`
- `marginBottom: '8px'` between categories

---

## 5. Visual Signature Elements

This template is intentionally minimal — the "visual signature" is the **absence of design**.

### 1. Flat Uppercase Section Headings
`<h2>` in 13px, weight 700, uppercase, letterSpacing 0.08em, color `#111111`. No underline, no border, no background, no color accent. The heading is visually distinguished only by uppercase + bold weight against the body text below it.

### 2. Inline Pipe-Separated Contact Line
All contact fields (email, phone, city/country, LinkedIn, portfolio) are joined into a single `<p>` string with ` | ` separators. No icons, no multi-line layout, no labels. This single string is the ATS-friendly contact block.

### 3. Flex Job Header Row
Each job/project/education item starts with a flex row: job title (h3, left) + date (span, right). Company/meta below as a separate `<p>`. Clean two-line header per item.

### 4. Bullet List for Skills
Skills are rendered as indented `• item` lines under a bold category label. Not tag chips or comma-separated — plain text bullets for ATS readability.

---

## 6. Section-by-Section Breakdown

### Contact Block (top of page)
- **Location:** Top, full width
- **Name (h1):** `22px weight-700 #111111`
- **Contact line (p):** Pipe-joined string: `email | phone | city, country | linkedinUrl | portfolioUrl`, `13px #444444`

### Professional Summary
- **Location:** First section after contact
- **Heading (h2):** `PROFESSIONAL SUMMARY`, 13px bold uppercase `#111111`
- **Body:** Plain `<p>` — `{data.professionalSummary}`. **Not rich-text.** `margin: 0`

### Work Experience
- **Location:** Second section
- **Heading:** `WORK EXPERIENCE`
- **Items:** Each job = flex header row (role `<h3>` + duration `<span>`) + company `<p>` + responsibilities rich-text div (`styles.bulletList`: `margin: 4px 0 12px 0`, `paddingLeft: 18px`)
- **Item spacing:** `marginBottom: 12px`

### Projects
- **Location:** Third section
- **Heading:** `PROJECTS`
- **Items:** flex header row (project name `<h3>` + role `<span>`) + technologies `<p>` (if present, prefixed "Technologies: ") + description rich-text (`margin: 4px 0 0 0`)
- **Item spacing:** `marginBottom: 10px`

### Education
- **Location:** Fourth section
- **Heading:** `EDUCATION`
- **Items:** flex header row (degree `<h3>` composed as `degreeType in major` + graduationDate `<span>`) + institution+GPA+honors `<p>` + optional coursework rich-text (`12px #444444`)
- **Item spacing:** `marginBottom: 10px`
- **Note:** The h3 shows degree title (not university name); university is in the meta `<p>` below

### Skills
- **Location:** Fifth section
- **Heading:** `SKILLS`
- **Items:** For each category: bold category `<span>` + indented `<div>` with `• item` lines. Languages are injected as a synthetic category called "Languages".
- **Item spacing:** `marginBottom: 8px`

### Certifications
- **Location:** Last section (only shown if not empty)
- **Heading:** `CERTIFICATIONS`
- **Body:** Rich-text via `dangerouslySetInnerHTML`

**Note:** The `extracurriculars` / Activities section is **not rendered** in this template. The source code has no section for it.

---

## 7. Current Design Limitations / Gaps

1. **Visually indistinct — nearly identical to a plain Word document** — Without any color, border, or visual separator, ATS Clean looks like default typing. Recruiters scanning printed or on-screen resumes have no visual cues to quickly find sections.
2. **Section headings have no visual separator from body text** — The only differentiation between an `<h2>` section heading and the body content below it is uppercase + bold + 1px extra size (`13px` vs `12px`). There is no `border-bottom`, background highlight, or spacing line to create a clear break.
3. **Skills rendered as bullet list, not chips or tags** — ATS templates typically favor plain text for machine readability, but the bullet-list-under-category layout can look disjointed when categories have only 1–2 items. A comma-separated inline format would be equally ATS-safe and more compact.
4. **No differentiation between job title and company name weight/size** — `<h3>` (13px bold `#111111`) and company `<p>` (12px `#555555`) are very similar in visual weight. A recruiter skimming quickly may not immediately register where one job ends and another begins.
5. **Contact line is plain pipe-separated text with no icons or layout** — Fine for ATS parsing but visually monotonous. Even within ATS constraints, subtle formatting (slightly larger/bolder name, light grey for the contact line) could improve human readability without harming ATS.
6. **Summary is plain text, not rich-text** — `{data.professionalSummary}` renders as a text node. If the user writes their summary with bullet points in the rich-text editor, those bullets are stripped here.
7. **Extracurriculars section is missing entirely** — The `data.extracurriculars` field is never rendered. Users who enter extracurricular activities in the form will silently have that data excluded from this template.
8. **Skills indentation uses `paddingLeft: 8px`** — A relatively small indent. On short category names followed by long skill items, the visual grouping between "category: item" can feel loose.
9. **No fallback content for empty name** — The code does `data.fullName || 'Your Name'` as a fallback. This is good UX, but the contact line has `|| 'email@example.com | phone | location'` as a fallback, which may be confusing in preview if the user hasn't filled in contact info yet.
10. **Section order is hardcoded** — Summary → Experience → Projects → Education → Skills → Certifications. Users cannot reorder sections. For candidates who want to highlight Education first (e.g. fresh graduates), this order is suboptimal.

---

## 8. Technical Constraints (Must Not Break)

1. **Inline styles only** — no Tailwind classes, no external CSS files. The template renders inside Puppeteer for PDF generation; only inline styles and a single `<style>` tag are supported.
2. **`<style>` tag for `.rich-content`** — the existing `<style>` block for `.rich-content ul/ol/li/p` must be preserved. It is the only accepted CSS injection.
3. **`width: '100%'` and `minHeight: '100%'`** on outermost div — these are set in `styles.page` and must not be removed.
4. **No external images or icon libraries** — no icons at all in this template (none exist currently). Do not add any. ATS templates must remain icon-free.
5. **`isEmptyRichText(html)`** — must be called before every `dangerouslySetInnerHTML` on a rich-text field.
6. **No photo support** — `data.profilePhoto` must NOT be used in ATS templates. Do not add a photo section.
7. **Props interface:** `{ data: ResumeFormData }` — note: `isPreview` is **not destructured** in this template (the component signature is `({ data })`). Do not add `boxShadow` behaviour.
   - Actually: the component signature is `({ data })` with no `isPreview`. If adding isPreview behaviour, follow the pattern from other templates but keep it optional.
8. **`ResumeFormData` fields used by this template:**
   - `data.fullName`
   - `data.email`
   - `data.phone`
   - `data.city`, `data.country`
   - `data.linkedinUrl`
   - `data.portfolioUrl`
   - `data.professionalSummary`
   - `data.skills.categories` (array of `{ category, items[] }`)
   - `data.skills.languages` (array of `{ language, proficiency }`)
   - `data.education` (array of `{ degreeType, major, university, graduationDate, gpa, honors, relevantCoursework }`)
   - `data.experience` (array of `{ role, company, duration, responsibilities }`)
   - `data.projects` (array of `{ name, role, description, technologies }`)
   - `data.certifications` (rich-text string)
   - **NOT used:** `data.profilePhoto`, `data.targetRole`, `data.additionalLinks`, `data.extracurriculars`

---

## 9. Full Current Source Code

```tsx
import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const styles = {
  page: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '12px',
    color: '#222222',
    backgroundColor: '#ffffff',
    padding: '48px 52px',
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
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

const ATSCleanTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const contactParts = [
    data.email,
    data.phone,
    [data.city, data.country].filter(Boolean).join(', '),
    data.linkedinUrl,
    data.portfolioUrl,
  ].filter(Boolean).join(' | ');

  const skillGroups = [
    ...data.skills.categories.filter((c) => c.category.trim() && c.items.length > 0),
    ...(data.skills.languages.filter((l) => l.language).length > 0
      ? [{
          category: 'Languages',
          items: data.skills.languages.filter((l) => l.language).map(
            (l) => `${l.language}${l.proficiency ? ` (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})` : ''}`
          ),
        }]
      : []),
  ];

  return (
    <div style={styles.page}>
      <style>{`
        .rich-content ul { list-style-type: disc; padding-left: 16px; margin: 4px 0; }
        .rich-content ol { list-style-type: decimal; padding-left: 16px; margin: 4px 0; }
        .rich-content li { margin-bottom: 2px; }
        .rich-content p { margin: 0; }
      `}</style>

      {/* Contact Block */}
      <div>
        <h1 style={styles.name}>{data.fullName || 'Your Name'}</h1>
        <p style={styles.contactLine}>{contactParts || 'email@example.com | phone | location'}</p>
      </div>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Professional Summary</h2>
          <p style={{ margin: 0 }}>{data.professionalSummary}</p>
        </section>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Work Experience</h2>
          {data.experience.map((job, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={styles.jobHeader}>
                  <h3 style={styles.jobTitle}>{job.role}</h3>
                  <span style={{ fontSize: '12px', color: '#555555' }}>{job.duration}</span>
                </div>
                <p style={styles.jobMeta}>{job.company}</p>
                {!isEmptyRichText(job.responsibilities) && (
                  <div className="rich-content" style={styles.bulletList} dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                )}
              </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{proj.name}</h3>
                {proj.role && (
                  <span style={{ fontSize: '12px', color: '#555555' }}>{proj.role}</span>
                )}
              </div>
              {proj.technologies && (
                <p style={styles.jobMeta}>Technologies: {proj.technologies}</p>
              )}
              {!isEmptyRichText(proj.description) && (
                <div className="rich-content" style={{ margin: '4px 0 0 0', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: proj.description }} />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Education</h2>
          {data.education.map((edu, i) => {
            const degree = [edu.degreeType, edu.major].filter(Boolean).join(' in ');
            return (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={styles.jobHeader}>
                  <h3 style={styles.jobTitle}>{degree || edu.university}</h3>
                  <span style={{ fontSize: '12px', color: '#555555' }}>{edu.graduationDate}</span>
                </div>
                <p style={styles.jobMeta}>
                  {edu.university}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  {edu.honors ? ` | ${edu.honors}` : ''}
                </p>
                {!isEmptyRichText(edu.relevantCoursework) && (
                  <div style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#444444' }}>
                    <span>Relevant Coursework: </span>
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: edu.relevantCoursework! }} />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Skills */}
      {skillGroups.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Skills</h2>
          {skillGroups.map((group, i) => (
            group.items.length > 0 && (
              <div key={i} style={{ ...styles.skillRow, marginBottom: '8px' }}>
                <span style={styles.skillCategory}>{group.category}</span>
                <div style={{ paddingLeft: '8px', marginTop: '2px' }}>
                  {group.items.map((item, j) => (
                    <div key={j} style={{ fontSize: '12px' }}>• {item}</div>
                  ))}
                </div>
              </div>
            )
          ))}
        </section>
      )}

      {/* Certifications */}
      {!isEmptyRichText(data.certifications) && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Certifications</h2>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: data.certifications! }} />
        </section>
      )}

    </div>
  );
};

export default ATSCleanTemplate;
```
