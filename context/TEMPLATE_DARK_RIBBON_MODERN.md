# Template Design Brief: Dark Ribbon Modern

## 1. Template Overview

- **Template ID (DB slug):** `dark_ribbon_modern`
- **Category:** modern
- **Target audience / design intent:** Professionals who want a sophisticated, editorial feel. The near-black sidebar contrasts sharply with the white right column; full-bleed dark ribbon section headers give the layout a structured magazine-editorial quality. Entirely greyscale — no color accent — which reads as serious and understated.
- **Photo support:** Yes — arched/pill-top frame with grey (`#666666`) background
- **Layout:** Two-column flex row. Left column is a dark sidebar (`35%` width); right column is the main content area (`65%` width).

---

## 2. Color Palette

| Role | Hex | Where used |
|---|---|---|
| Left column background | `#2b2b2b` | Left sidebar background |
| Ribbon header background | `#151515` | Section header ribbon bars (both columns) |
| Page/right column background | `#f5f5f5` | Outermost wrapper background |
| Right column content bg | `#ffffff` | (inherits from f5f5f5; right col has no explicit bg set) |
| Name text | `#4a4e59` | h1 full name (right column) |
| Target role text | `#888888` | h2 target role (right column), date text in education items, company/meta text |
| Timeline dot | `#5b6270` | 0.08in filled circle on timeline items |
| Timeline line | `#cccccc` | 1px vertical line connecting timeline items |
| Left col body text | `#cccccc` | Skills items, contact values, summary text |
| Right col primary text | `#333333` | Job title, university, project name (bold, main label) |
| Right col secondary text | `#555555` | Responsibilities body, degree, project description |
| Right col tertiary / meta text | `#888888` | Date, company+duration meta line, coursework, GPA, honors, project tech/link |
| Contact icon circle bg | `#555555` | 22px circle behind contact SVG icons |
| Left col languages label | `#aaaaaa` | "Languages" sub-label inside skills section |
| Photo frame bg | `#666666` | Arched photo container background |
| Icon color (SVG stroke) | `white` | All contact icons |
| Ribbon header text | `#ffffff` | Section heading text on dark ribbons |

---

## 3. Typography

- **Font family:** `"Helvetica Neue", Helvetica, Arial, sans-serif`
- **Base font size / line height:** `10pt` for body, `lineHeight: 1.5`

| Element | Size | Weight | Transform | Color |
|---|---|---|---|---|
| Full name (h1) | `46pt` | `800` | none (each word on its own line via `<br/>`) | `#4a4e59` |
| Target role (h2 below name) | `16pt` | `normal` | italic | `#888888` |
| Left col ribbon header | `14pt` | `bold` | none | `#ffffff` |
| Right col ribbon header | `18pt` | `bold` | none | `#ffffff` |
| Job title / project name / university | `11pt` | `bold` | none | `#333333` |
| Company+duration meta line | `10pt` | normal | none | `#888888` |
| Date / graduation date | `10pt` | normal | none | `#888888` |
| Responsibilities / description body | `10pt` | normal | none | `#555555`, `lineHeight: 1.5` |
| GPA / honors / coursework | `10pt` | normal | none | `#888888` |
| Skills category label | `10pt` | `bold` | none | `#cccccc` (inherits from parent) |
| Skills items | `10pt` | normal | none | `#cccccc` |
| Languages sub-label | `10pt` | `bold` | none | `#aaaaaa` |
| Languages value | `10pt` | normal | none | `#cccccc` |
| Contact values | `10pt` | normal | none | `#cccccc` |
| Left col summary text | `10pt` | normal | none | `#cccccc` |

---

## 4. Layout & Dimensions

**Overall structure:**
```
┌────────────────────┬──────────────────────────────────┐
│  Left col (35%)    │  Right col (65%)                 │
│  bg: #2b2b2b       │  padding: 0.5in 0                │
│  paddingBottom:    │                                  │
│    0.4in           │                                  │
│  (no top padding — │                                  │
│   photo/ribbon     │                                  │
│   starts at top)   │                                  │
└────────────────────┴──────────────────────────────────┘
```

**Left column (`width: '35%'`):**
- `paddingBottom: '0.4in'` — only bottom padding; no top/horizontal padding on the column itself
- Content sections use `padding: '0.15in 0.4in 0'` for the body (after the ribbon)
- Ribbon headers bleed: `width: 'calc(100% + 0.3in)'` — overflows the right edge of the column to create a ribbon that extends into the gap between columns visually
- Photo: starts at the very top of the left column, no padding, height `2.5in`

**Right column (`width: '65%'`):**
- `padding: '0.5in 0'` — vertical padding only
- Name header: `padding: '0 0.5in'`, `marginBottom: '0.4in'`
- Section content body: `padding: '0 0.5in'`
- Ribbon headers: full width of the right column at `padding: '0.1in 0.5in'` (no calc trick needed — right col has no inner padding offset to overcome)

**Timeline layout (Experience/Projects):**
- Outer container: `position: relative`, `padding: '0 0.5in'`
- Vertical line: `position: absolute`, `top: '0.08in'`, `bottom: '0.2in'`, `left: '0.54in'` (= 0.5in col padding + 0.04in into the dot area), `borderLeft: '1px solid #cccccc'`, `zIndex: 1`. Only shown when `length > 1`.
- Each item row: `display: flex`, `marginBottom: '0.2in'`, `position: relative`, `zIndex: 2`
- Dot area: `width: '0.2in'`, `marginTop: '0.05in'`; dot itself `width: 0.08in`, `height: 0.08in`, `backgroundColor: #5b6270`, `borderRadius: 50%`

**Education layout (no timeline line):**
- Same dot + flex structure as experience/projects but no vertical connecting line
- Items: `marginBottom: '0.15in'`

**Photo frame (left col):**
- Container: `marginBottom: '0.3in'`
- Inner: `backgroundColor: #666666`, `borderTopLeftRadius: '1.5in'`, `borderTopRightRadius: '1.5in'`, `padding: '0.1in 0.1in 0'`, `height: '2.5in'`
- `<img>`: `objectFit: cover`, `borderTopLeftRadius: '1.4in'`, `borderTopRightRadius: '1.4in'`

---

## 5. Visual Signature Elements

### 1. Full-Bleed Dark Ribbon Section Headers
The most distinctive element. Section headings are not styled text — they are dark (`#151515`) filled bar strips spanning the full width of their column. In the **left column**, the ribbon uses `width: 'calc(100% + 0.3in)'` to bleed 0.3in past the right edge of the column, visually bridging into the gap between columns. In the **right column**, ribbons span the full 65% column width (`padding: 0.1in 0.5in`).

### 2. Massive Name Treatment
The full name is 46pt, weight 800, color `#4a4e59` (blue-grey). Crucially, each word in the name is forced to its own line using `split(' ')` + `<br/>` fragments. For a two-word name like "John Smith", this creates a large stacked typographic block.

### 3. Greyscale-Only Palette
Unlike other templates, there is zero color accent. The entire palette is: near-black (`#2b2b2b`, `#151515`), dark grey (`#4a4e59`, `#5b6270`), mid-grey (`#888888`, `#aaaaaa`), light grey (`#cccccc`, `#555555`), and white. This reads as intentionally monochromatic and serious.

### 4. Timeline Connector (Experience & Projects)
When there are 2+ items, a vertical `1px solid #cccccc` line connects the timeline dots down the left side of the list. Each item has a small `#5b6270` filled circle (0.08in) as the timeline dot. The line is absolutely positioned and sits behind the content rows via `zIndex`.

### 5. Arched Photo Frame
A tall (2.5in) arch-topped container with `#666666` background. The photo fills the arch with `objectFit: cover`. The arch uses large `borderTopLeftRadius`/`borderTopRightRadius` of `1.5in`.

### 6. Contact Icons in Circle Badges
Each contact item has a `22px × 22px` circle with `#555555` background containing a 12px white SVG icon. The value text sits to the right with a `0.1in` gap. Clean, minimal, and consistent.

---

## 6. Section-by-Section Breakdown

### Profile Photo (Left column, top)
- **Location:** Left column, very top (no padding above it)
- **Container:** `marginBottom: 0.3in`
- **Frame:** `#666666` arch, `height: 2.5in`, top border-radius `1.5in`

### Summary (Left column)
- **Location:** Left column, below photo
- **Section heading:** Full-bleed `#151515` dark ribbon, 14pt bold white, `width: calc(100% + 0.3in)`, `padding: 0.1in 0.4in`
- **Body:** `10pt #cccccc`, `lineHeight: 1.5`, plain text (not rich-text — uses `{data.professionalSummary}` directly)

### Skills (Left column)
- **Location:** Left column, below Summary
- **Section heading:** Same full-bleed ribbon as Summary
- **Items:** Category label (`10pt bold #cccccc`), then a `<ul>` with `listStyleType: disc`, `paddingLeft: 0.12in`, each item `10pt #cccccc`. Languages get their own sub-section with label `#aaaaaa` and value joined by ` • `

### Contact (Left column)
- **Location:** Left column, below Skills
- **Section heading:** Same full-bleed ribbon
- **Items:** Flex row — 22px circle icon badge + text value (`10pt #cccccc`). Items rendered: phone, email, portfolioUrl, linkedinUrl, additionalLinks, city/country (in that order)

### Name + Target Role (Right column, top)
- **Location:** Right column header, above first section ribbon
- **Name (h1):** `46pt weight-800 #4a4e59`, each word on its own `<br/>`-separated line, `lineHeight: 1.0`
- **Target role (h2):** `16pt normal italic #888888`, immediately below name

### Education (Right column)
- **Location:** Right column, first section
- **Section heading:** Full-width `#151515` ribbon, `18pt bold white`, `padding: 0.1in 0.5in`
- **Items:** Dot + flex layout (no vertical connecting line). Each item: `10pt #888888` date → `11pt bold #333333` university → `10pt #555555` degree → optional GPA/honors/coursework in `10pt #888888`

### Work Experience (Right column)
- **Location:** Right column
- **Section heading:** Same `#151515` ribbon, `18pt bold white`
- **Items:** Dot + flex layout with optional vertical timeline line (when >1 item). Each item: `11pt bold #333333` role → `10pt #888888` "company | duration" meta → responsibilities rich-text `10pt #555555`

### Projects (Right column)
- **Location:** Right column
- **Section heading:** Same ribbon
- **Items:** Same dot + timeline structure as Experience. `11pt bold #333333` project name → `10pt #888888` "role | technologies" meta → description rich-text `10pt #555555` → link `10pt #888888`

### Certifications (Right column)
- **Location:** Right column
- **Section heading:** Same `#151515` ribbon
- **Body:** Rich-text via `dangerouslySetInnerHTML`, `10pt #555555 lineHeight 1.6`, padded `0 0.5in`

### Activities / Extracurriculars (Right column)
- **Location:** Right column, last section
- **Section heading:** Same ribbon (title rendered as "Activities")
- **Body:** Rich-text, same style as Certifications

---

## 7. Current Design Limitations / Gaps

1. **`calc(100% + 0.3in)` ribbon hack** — The left column ribbon uses `width: calc(100% + 0.3in)` to bleed past the column's right edge. This is a fragile layout hack; if the column-gap between left/right columns changes or at certain print widths, the ribbon may either not reach the right column or overflow visibly. There is no `overflow: hidden` on the parent to contain the bleed cleanly.
2. **Name forced to multi-line even for short names** — `split(' ').map(name => <Fragment>{name}<br/></Fragment>)` always breaks the name at every space. A person with a single-word name gets one line (fine); but a person with a three-word name like "Mary Jane Watson" gets three very short lines, creating awkward whitespace.
3. **Summary in left col is plain text, not rich-text** — `{data.professionalSummary}` is rendered as a text node. Other templates support rich-text summaries. Users who format their summary with bullet points will lose that formatting here.
4. **Entirely greyscale — no color differentiation** — The monochrome palette makes it hard to visually distinguish between role title, company, date, and description. Everything reads at a similar visual weight except the ribbon headers.
5. **Right column has no explicit background color** — The right column inherits `#f5f5f5` from the outer wrapper. This means the right content area is not pure white, which may look unintentional or slightly grey in print.
6. **Left column has no top padding** — The photo (if present) starts at the absolute top of the sidebar, which can look clipped in PDF export where page margins may not be present.
7. **Contact section is always rendered** — Unlike other templates that guard `{((data?.city || data?.country) || data?.email || data?.phone) && ...}`, the Dark Ribbon Modern wraps contact in `<div style={{ marginBottom: '0.3in' }}>` unconditionally (the ribbon heading always shows). If the user has no contact info, an empty "Contact" ribbon renders.
8. **No `width: '100%'` missing** — The template correctly has `width: '100%'` on the outermost div. ✓ (Not a bug.)
9. **Timeline line positioning is fragile** — The vertical line is `left: '0.54in'` (= `0.5in` right-col padding + `0.04in`). This is hardcoded and would misalign if column padding ever changes.
10. **Skills section uses a non-standard `<ul>` approach** — Unlike the left-col bullet approach in ModernYellowSplit (which renders `• item` as text), DarkRibbon uses a real `<ul listStyleType: disc>`. This inconsistency means the bullet appearance depends on browser/Puppeteer rendering of `list-style-type`.

---

## 8. Technical Constraints (Must Not Break)

1. **Inline styles only** — no Tailwind classes, no external CSS files. The template renders inside Puppeteer for PDF generation; only inline styles and a single `<style>` tag are supported.
2. **`<style>` tag for `.rich-content`** — the existing `<style>` block for `.rich-content ul/ol/li/p` must be preserved. It is the only accepted CSS injection.
3. **`width: '100%'` and `minHeight: '100%'`** on outermost div — never use a fixed `width: '8.5in'`.
4. **No external images or icon libraries** — SVG icons must remain defined as inline React components (`IconPhone`, `IconEmail`, `IconWeb`, `IconLocation`).
5. **`isEmptyRichText(html)`** — must be called before every `dangerouslySetInnerHTML` on a rich-text field.
6. **`data.profilePhoto`** — always guard with `data.profilePhoto &&` (not optional chaining — this template uses `data.profilePhoto` not `data?.profilePhoto`).
7. **Props interface:** `{ data: ResumeFormData, isPreview?: boolean }` — no other props.
8. **`isPreview` flag** — used exclusively for `boxShadow` on the outermost div. Keep this behaviour.
9. **`ResumeFormData` fields used by this template:**
   - `data.fullName`
   - `data.targetRole`
   - `data.profilePhoto`
   - `data.email`
   - `data.phone`
   - `data.city`, `data.country`
   - `data.portfolioUrl`
   - `data.linkedinUrl`
   - `data.additionalLinks` (array of `{ url, label }`)
   - `data.professionalSummary`
   - `data.skills.categories` (array of `{ category, items[] }`)
   - `data.skills.languages` (array of `{ language, proficiency }`)
   - `data.education` (array of `{ university, degreeType, major, graduationDate, gpa, honors, relevantCoursework }`)
   - `data.experience` (array of `{ role, company, duration, responsibilities }`)
   - `data.projects` (array of `{ name, role, description, technologies, link }`)
   - `data.certifications` (rich-text string)
   - `data.extracurriculars` (rich-text string)

---

## 9. Full Current Source Code

```tsx
// PDF-rendered: inline styles only
import React from 'react';
import { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const IconPhone = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
);

const IconEmail = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const IconWeb = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const IconLocation = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const DarkRibbonModernTemplate: React.FC<ResumeTemplateProps> = ({ data, isPreview }) => {
    return (
        <div style={{
            width: '100%',
            minHeight: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'row',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            boxSizing: 'border-box',
            boxShadow: isPreview ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            overflow: 'hidden'
        }}>
            <style>{`
              .rich-content ul { list-style-type: disc; padding-left: 16px; margin: 4px 0; }
              .rich-content ol { list-style-type: decimal; padding-left: 16px; margin: 4px 0; }
              .rich-content li { margin-bottom: 2px; }
              .rich-content p { margin: 0; }
            `}</style>
            {/* Left Column */}
            <div style={{
                width: '35%',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                paddingBottom: '0.4in',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Profile Photo */}
                {data.profilePhoto && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#666666',
                            borderTopLeftRadius: '1.5in',
                            borderTopRightRadius: '1.5in',
                            padding: '0.1in 0.1in 0',
                            height: '2.5in',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            overflow: 'hidden'
                        }}>
                            <img src={data.profilePhoto} alt={data.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '1.4in', borderTopRightRadius: '1.4in' }} />
                        </div>
                    </div>
                )}

                {/* Summary */}
                {data.professionalSummary && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.4in',
                            fontSize: '14pt',
                            fontWeight: 'bold',
                            width: 'calc(100% + 0.3in)',
                            boxSizing: 'border-box',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            Summary
                        </div>
                        <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.5, color: '#cccccc' }}>
                            {data.professionalSummary}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {(data.skills?.categories?.some((c) => c.items.length > 0) || data.skills?.languages?.some((l) => l.language)) && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.4in',
                            fontSize: '14pt',
                            fontWeight: 'bold',
                            width: 'calc(100% + 0.3in)',
                            boxSizing: 'border-box',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            Skills
                        </div>
                        <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.5, color: '#cccccc' }}>
                            {data.skills.categories.filter((c) => c.category.trim() && c.items.length > 0).length > 0 && (
                                <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                                    {data.skills.categories.filter((c) => c.category.trim() && c.items.length > 0).map((cat, idx) => (
                                        <li key={idx} style={{ marginBottom: '0.08in' }}>
                                            <div style={{ fontWeight: 'bold', marginBottom: '0.03in' }}>{cat.category}</div>
                                            <ul style={{ margin: 0, paddingLeft: '0.12in', listStyleType: 'disc' }}>
                                                {cat.items.map((item, i) => (
                                                    <li key={i} style={{ marginBottom: '0.02in' }}>{item}</li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {data.skills.languages?.filter((l) => l.language).length > 0 && (
                                <div style={{ marginTop: '0.1in' }}>
                                    <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#aaaaaa', marginBottom: '0.04in' }}>Languages</div>
                                    <div style={{ fontSize: '10pt', color: '#cccccc', lineHeight: 1.5 }}>
                                        {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})`).join(' • ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact */}
                <div style={{ marginBottom: '0.3in' }}>
                    <div style={{
                        backgroundColor: '#151515',
                        color: '#ffffff',
                        padding: '0.1in 0.4in',
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        width: 'calc(100% + 0.3in)',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        Contact
                    </div>
                    <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.6, color: '#cccccc', display: 'flex', flexDirection: 'column', gap: '0.1in' }}>
                        {data.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconPhone />
                                </div>
                                <span>{data.phone}</span>
                            </div>
                        )}
                        {data.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconEmail />
                                </div>
                                <span>{data.email}</span>
                            </div>
                        )}
                        {data.portfolioUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconWeb />
                                </div>
                                <span>{data.portfolioUrl}</span>
                            </div>
                        )}
                        {data.linkedinUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconWeb />
                                </div>
                                <span>{data.linkedinUrl}</span>
                            </div>
                        )}
                        {(data.additionalLinks || []).filter((l) => l.url).map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconWeb />
                                </div>
                                <span>{l.label ? `${l.label}: ${l.url}` : l.url}</span>
                            </div>
                        ))}
                        {(data.city || data.country) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconLocation />
                                </div>
                                <span>{[data.city, data.country].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div style={{
                width: '65%',
                padding: '0.5in 0',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}>
                {/* Header Name & Role */}
                <div style={{ padding: '0 0.5in', marginBottom: '0.4in' }}>
                    <h1 style={{ margin: '0 0 0.05in 0', fontSize: '46pt', color: '#4a4e59', lineHeight: 1.0, fontWeight: '800' }}>
                        {data.fullName?.split(' ').map((name, i, arr) => (
                            <React.Fragment key={i}>
                                {name}
                                {i < arr.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h1>
                    <h2 style={{ margin: 0, fontSize: '16pt', color: '#888888', fontWeight: 'normal', fontStyle: 'italic' }}>
                        {data.targetRole}
                    </h2>
                </div>

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Education
                        </div>
                        <div style={{ padding: '0 0.5in' }}>
                            {data.education.map((edu, idx) => (
                                <div key={idx} style={{ display: 'flex', marginBottom: '0.15in' }}>
                                    <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                        <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.02in' }}>
                                            {edu.graduationDate}
                                        </div>
                                        <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold' }}>
                                            {edu.university}
                                        </div>
                                        <div style={{ fontSize: '10pt', color: '#555555' }}>
                                            {edu.degreeType} {edu.major ? `in ${edu.major}` : ''}
                                        </div>
                                        {edu.gpa && (
                                            <div style={{ fontSize: '10pt', color: '#888888' }}>GPA: {edu.gpa}</div>
                                        )}
                                        {edu.honors && (
                                            <div style={{ fontSize: '10pt', color: '#888888' }}>{edu.honors}</div>
                                        )}
                                        {!isEmptyRichText(edu.relevantCoursework) && (
                                            <div style={{ fontSize: '10pt', color: '#888888', marginTop: '0.02in' }}>
                                                <span>Coursework: </span>
                                                <div className="rich-content" dangerouslySetInnerHTML={{ __html: edu.relevantCoursework! }} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Work Experience */}
                {data.experience && data.experience.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Work Experience
                        </div>
                        <div style={{ padding: '0 0.5in', position: 'relative' }}>
                            {data.experience.length > 1 && (
                                <div style={{ position: 'absolute', top: '0.08in', bottom: '0.2in', left: '0.54in', borderLeft: '1px solid #cccccc', zIndex: 1 }}></div>
                            )}
                            {data.experience.map((exp, idx) => (
                                    <div key={idx} style={{ display: 'flex', marginBottom: '0.2in', position: 'relative', zIndex: 2 }}>
                                        <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                            <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold', marginBottom: '0.02in' }}>
                                                {exp.role}
                                            </div>
                                            <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.05in' }}>
                                                {exp.company} | {exp.duration}
                                            </div>
                                            {!isEmptyRichText(exp.responsibilities) && (
                                                <div className="rich-content" style={{ fontSize: '10pt', color: '#555555', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: exp.responsibilities }} />
                                            )}
                                        </div>
                                    </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {data.projects && data.projects.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Projects
                        </div>
                        <div style={{ padding: '0 0.5in', position: 'relative' }}>
                            {data.projects.length > 1 && (
                                <div style={{ position: 'absolute', top: '0.08in', bottom: '0.2in', left: '0.54in', borderLeft: '1px solid #cccccc', zIndex: 1 }}></div>
                            )}
                            {data.projects.map((proj, idx) => {
                                return (
                                    <div key={idx} style={{ display: 'flex', marginBottom: '0.2in', position: 'relative', zIndex: 2 }}>
                                        <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                            <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold', marginBottom: '0.02in' }}>
                                                {proj.name}
                                            </div>
                                            <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.05in' }}>
                                                {proj.role} {proj.technologies ? `| ${proj.technologies}` : ''}
                                            </div>
                                            {!isEmptyRichText(proj.description) && (
                                                <div className="rich-content" style={{ fontSize: '10pt', color: '#555555', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: proj.description }} />
                                            )}
                                            {proj.link && (
                                                <div style={{ fontSize: '10pt', color: '#888888', marginTop: '0.02in' }}>
                                                    {proj.link}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Certifications */}
                {!isEmptyRichText(data.certifications) && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Certifications
                        </div>
                        <div className="rich-content" style={{ padding: '0 0.5in', fontSize: '10pt', color: '#555555', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: data.certifications! }} />
                    </div>
                )}

                {/* Extracurriculars */}
                {!isEmptyRichText(data.extracurriculars) && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Activities
                        </div>
                        <div className="rich-content" style={{ padding: '0 0.5in', fontSize: '10pt', color: '#555555', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: data.extracurriculars! }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DarkRibbonModernTemplate;
```
