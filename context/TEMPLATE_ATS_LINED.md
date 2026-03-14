# Template Design Brief: ATS Lined

## 1. Template Overview

- **Template ID (DB slug):** `ats_lined`
- **Category:** ats
- **Target audience / design intent:** Job seekers targeting ATS-heavy pipelines who want a slightly more polished look than the fully plain ATS Clean template. The only visual differentiation is a navy blue (`#1a3557`) accent on the name, section headings, and job titles, plus a `2px solid navy` underline on section headings. Still single-column and fully ATS-safe.
- **Photo support:** No — ATS templates must never add photo support
- **Layout:** Single-column, full-width. Identical structure to ATS Clean — all sections stack vertically.

---

## 2. Color Palette

| Role | Hex | Where used |
|---|---|---|
| Page background | `#ffffff` | Entire page |
| Primary text / body | `#222222` | Default body text on root |
| Accent (navy) | `#1a3557` | Name (h1), section headings (h2), job titles (h3), section heading border-bottom |
| Contact line | `#444444` | Pipe-separated contact string below name |
| Company / meta | `#555555` | Company name, institution, date spans |
| Date (right-aligned) | `#555555` | Date span in job header row |
| Skill category label | `#111111` | Bold skill category name (not accent) |

**Key difference from ATS Clean:** The addition of `#1a3557` (navy) on name, headings, and job titles. Skill category labels stay `#111111` (not navy). Everything else is identical to ATS Clean.

---

## 3. Typography

- **Font family:** `Arial, Helvetica, sans-serif`
- **Base font size:** `12px`
- **Base line height:** `1.5`

| Element | Size | Weight | Transform | Color | Notes |
|---|---|---|---|---|---|
| Full name (h1) | `22px` | `700` | none | `#1a3557` (navy) | `margin: 0 0 6px 0` |
| Contact line (p) | `13px` | normal | none | `#444444` | `margin: 0 0 24px 0`; pipe `\|` separated |
| Section heading (h2) | `13px` | `700` | `uppercase` | `#1a3557` (navy) | `letterSpacing: 0.08em`, `margin: 0 0 8px 0`, `paddingBottom: 5px`, `borderBottom: 2px solid #1a3557` |
| Job title / project name / degree (h3) | `13px` | `700` | none | `#1a3557` (navy) | `margin: 0` |
| Date span (right side of header row) | `12px` | normal | none | `#555555` | |
| Company / meta (p) | `12px` | normal | none | `#555555` | `margin: 0 0 6px 0` |
| Body / responsibilities | inherits `12px` | normal | none | `#222222` | via `.rich-content` |
| Skill category label | inherits `12px` | `700` | none | `#111111` | inline `<span>` — **NOT navy** |
| Skill items | `12px` | normal | none | `#222222` | bullet `•` prefix as text |

**Differences from ATS Clean typography:**
- Name color: `#111111` → `#1a3557`
- Section heading color: `#111111` → `#1a3557`
- Section heading adds: `paddingBottom: 5px`, `borderBottom: 2px solid #1a3557`
- Job title color: `#111111` → `#1a3557`
- Everything else is identical.

---

## 4. Layout & Dimensions

**Identical to ATS Clean.** See ATS Clean for full layout detail. Summary:

```
┌──────────────────────────────────────────┐
│  padding: 48px 52px (all sides)          │
│                                          │
│  [Name — navy #1a3557]                   │
│  [Contact line — grey]                   │
│                                          │
│  PROFESSIONAL SUMMARY ──────────────     │  ← navy 2px underline on heading
│  [body text]                             │
│                                          │
│  WORK EXPERIENCE ───────────────────     │
│  [job items...]                          │
│                                          │
│  PROJECTS ──────────────────────────     │
│  ...                                     │
│                                          │
│  EDUCATION ─────────────────────────     │
│  ...                                     │
│                                          │
│  SKILLS ────────────────────────────     │
│  ...                                     │
│                                          │
│  CERTIFICATIONS ────────────────────     │
│  ...                                     │
└──────────────────────────────────────────┘
```

**Page padding:** `48px` top/bottom, `52px` left/right.
**Section spacing:** `marginBottom: '20px'` on each `<section>`.

**Section heading visual treatment:**
- `borderBottom: '2px solid #1a3557'` — full-width navy underline across the heading text
- `paddingBottom: '5px'` — gap between text and underline

---

## 5. Visual Signature Elements

### 1. Navy Accent on Headings and Titles
The only visual differentiation from ATS Clean. Navy `#1a3557` is applied to three levels: name (h1), section headings (h2), job/project/degree titles (h3). Creates a clear visual hierarchy without adding columns or decorative elements.

### 2. Section Heading Underline
`<h2>` section headings have `borderBottom: 2px solid #1a3557` with `paddingBottom: 5px`. This is the most visible design element — a full-width navy rule separates each section heading from its body content. Subtle but effective for human-scanning the resume.

### 3. Inline Pipe-Separated Contact Line
Same as ATS Clean — all contact fields joined as a single `<p>` string with ` | ` separators. ATS-safe, no icons.

### 4. Flex Job Header Row
Same as ATS Clean — job title (h3 left, navy) + date (span right, grey), company `<p>` below.

---

## 6. Section-by-Section Breakdown

All sections are structurally **identical to ATS Clean**. The only changes are:
- Name (h1) is navy instead of near-black
- Section headings (h2) are navy + underlined instead of plain black
- Job/project/degree titles (h3) are navy instead of near-black

### Contact Block (top of page)
- **Name (h1):** `22px weight-700 #1a3557`
- **Contact line (p):** Pipe-joined string, `13px #444444`

### Professional Summary
- **Heading (h2):** `PROFESSIONAL SUMMARY`, 13px bold uppercase `#1a3557`, `borderBottom: 2px solid #1a3557`
- **Body:** Plain `<p>` — `{data.professionalSummary}`. **Not rich-text.**

### Work Experience
- **Heading:** `WORK EXPERIENCE`, navy + underline
- **Items:** flex header (role `<h3 navy>` + duration `<span grey>`) + company `<p grey>` + responsibilities rich-text
- **Item spacing:** `marginBottom: 12px`

### Projects
- **Heading:** `PROJECTS`, navy + underline
- **Items:** flex header (project name `<h3 navy>` + role `<span grey>`) + technologies `<p grey>` + description rich-text
- **Item spacing:** `marginBottom: 10px`

### Education
- **Heading:** `EDUCATION`, navy + underline
- **Items:** flex header (degree title `<h3 navy>` + graduation date `<span grey>`) + institution+GPA+honors `<p grey>` + optional coursework rich-text
- **Item spacing:** `marginBottom: 10px`

### Skills
- **Heading:** `SKILLS`, navy + underline
- **Items:** Bold category `<span #111111>` (not navy) + indented `• item` lines. Languages as synthetic category.
- **Item spacing:** `marginBottom: 8px`

### Certifications
- **Heading:** `CERTIFICATIONS`, navy + underline
- **Body:** Rich-text via `dangerouslySetInnerHTML`

**Note:** Same as ATS Clean — the `extracurriculars` / Activities section is **not rendered** in this template.

---

## 7. Current Design Limitations / Gaps

All limitations from ATS Clean apply here, plus:

1. **Nearly identical to ATS Clean — insufficient differentiation** — The only visual difference is the navy color + section heading underline. From a recruiter's perspective, the two templates look almost the same. A user choosing between ATS Clean and ATS Lined would be hard-pressed to justify either over the other beyond personal color preference.
2. **Skill category labels are `#111111`, not navy** — Inconsistency: name, headings, and job titles use navy `#1a3557`, but skill category labels use `#111111`. This looks like an oversight rather than an intentional design decision. Either all bold labels should use navy, or none should.
3. **Section heading underline spans only the text width, not the full column** — `borderBottom` on an `<h2>` (which is a block element) will extend to the full container width by default. This is correct behaviour. However, combined with `margin: 0 0 8px 0` and `paddingBottom: 5px`, the total gap between the heading rule and the first body item is 13px (5px padding + 8px margin), which may feel slightly loose.
4. **Summary is plain text, not rich-text** — Same as ATS Clean.
5. **Extracurriculars section missing** — Same as ATS Clean.
6. **Contact line has no visual separation from name** — A 24px margin (`margin: 0 0 24px 0`) follows the contact `<p>`. But there is no spacing between the name `<h1>` and the contact line — only the `6px` name margin. The contact line sits very close to the name.
7. **Both ATS templates share the same section order** — Summary → Experience → Projects → Education → Skills → Certifications. This may not be optimal for all users (e.g. fresh graduates want Education first).
8. **No `targetRole` field rendered** — The `data.targetRole` field is ignored. A single-line role title below the name would improve ATS Lined (unlike ATS Clean, the navy name heading has room for a subtitle without visual clutter).
9. **`additionalLinks` not rendered** — `data.additionalLinks` is assembled in the `contactParts` array in ATS Clean but **is not included** in ATS Lined's contact assembly. Users with custom links (GitHub, portfolio) will have them silently dropped.

---

## 8. Technical Constraints (Must Not Break)

1. **Inline styles only** — no Tailwind classes, no external CSS files.
2. **`<style>` tag for `.rich-content`** — the existing `<style>` block must be preserved.
3. **`width: '100%'` and `minHeight: '100%'`** on outermost div — set in `styles.page`, must not be removed.
4. **No external images or icon libraries** — no icons; keep it that way.
5. **`isEmptyRichText(html)`** — must be called before every `dangerouslySetInnerHTML`.
6. **No photo support** — `data.profilePhoto` must NOT be used.
7. **Props interface:** `{ data: ResumeFormData }` — `isPreview` is not destructured in this template.
8. **`ACCENT` constant** — the navy color `#1a3557` is stored in a module-level `const ACCENT = '#1a3557'`. All accent color usages reference this constant. Any color changes should update only this constant.
9. **`ResumeFormData` fields used by this template:**
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

const ACCENT = '#1a3557';

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

const ATSLinedTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
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

export default ATSLinedTemplate;
```
