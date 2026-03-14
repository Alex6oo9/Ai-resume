# Template Design Brief: Modern Yellow Split

## 1. Template Overview

- **Template ID (DB slug):** `modern_yellow_split`
- **Category:** modern
- **Target audience / design intent:** Fresh graduates and early-career professionals who want a bold, visually striking resume. The yellow-on-dark left column commands attention; the numbered section system gives a structured, almost editorial feel.
- **Photo support:** Yes — arched/pill-top frame with yellow background
- **Layout:** Two-column flex row. Left column is a dark sidebar (38% width); right column is the main content area (flex: 1, takes the remaining ~62%).

---

## 2. Color Palette

| Role | Hex | Where used |
|---|---|---|
| Primary accent | `#fdb913` | Yellow name bar, section number circles, dotted dividers, contact icon strip tabs, photo frame background, pill-border section headers (left col) |
| Dark sidebar background | `#2c2c2c` | Left column background |
| Page background / right col bg | `#ffffff` | Entire page base |
| Dark date chip / left label | `#333` | Date chips in experience/education/project items; target role text; date label backgrounds |
| Body text | `#333` | Default text color on root div |
| Icon strip label text (white) | `#ffffff` | Name bar text, section number circle text, icon strip icon color |
| Muted body text | `#555` | Summary paragraph, right-col body text |
| Muted metadata | `#666` | Education/experience body detail text |
| Pale metadata | `#888` | Project tech/link text |
| Left-col body text | `#e0e0e0` | Skills items, contact value text in left sidebar |
| Left-col divider | `#ddd` | 1px solid vertical border between date column and content column in items |

---

## 3. Typography

- **Font family:** `Arial, Helvetica, sans-serif`
- **Base font size / line height:** `color: #333`, `lineHeight: 1.5` on root

| Element | Size | Weight | Transform | Color |
|---|---|---|---|---|
| Full name (h1) | `28pt` | normal (no explicit weight) | `uppercase`, `letterSpacing: 2px` | `#fff` (on yellow bar) |
| Target role (h3) | `14pt` | `normal` | `uppercase`, `letterSpacing: 2px` | `#333` |
| Left col section headers (h2) | `12pt` | `bold` | `uppercase`, `letterSpacing: 1px` | `#ffffff` |
| Right col section headers (h2) | `14pt` | `bold` | `uppercase`, `letterSpacing: 1px` | `#333` (dark) |
| Section number circle | `14pt` | `bold` | — | `#fff` |
| Contact label (ADDRESS / WEB / PHONE) | `10pt` | `bold` | uppercase | `#ffffff` |
| Contact value | `9pt` | normal | — | `#e0e0e0` |
| Skill category label | `10pt` | `bold` | `uppercase` | `#ffffff` |
| Skill items | `9pt` | normal | — | `#e0e0e0` |
| Date chip | `8pt` | `bold` | — | `#fff` on `#333` bg |
| Company / university label (left mini-col) | `9pt` | `bold` | `uppercase` | `#555` |
| Item heading (role / degree title) | `10pt` | `bold` | `uppercase` | `#333` |
| Item body / responsibilities | `9pt` | normal | — | `#666` |
| Summary paragraph | `10pt` | normal | — | `#555`, `lineHeight: 1.6` |
| Project tech / link | `9pt` | normal | italic (tech) | `#888` |

---

## 4. Layout & Dimensions

**Overall structure:**
```
┌──────────────────┬────────────────────────────────┐
│  Left col (38%)  │  Right col (flex: 1, ~62%)     │
│  bg: #2c2c2c     │  bg: #ffffff                   │
│  padding: 29pt 0 │  padding: 36pt 0               │
└──────────────────┴────────────────────────────────┘
```

**Left column (`width: '38%'`):**
- `padding: '29pt 0'` — vertical padding only; horizontal is 0 at the column level
- Inner sections use `padding: '0 20pt'` for horizontal inset
- Contact item rows: full bleed left (icon tab starts at the left edge, 0pt from column edge), text has `paddingRight: '14pt'`
- Icon tabs: `width: '44pt'`, `marginRight: '11pt'`

**Right column (`flex: 1`):**
- `padding: '36pt 0'` — vertical only at column level
- Name bar: full-width yellow strip, `padding: '11pt 36pt'`
- Target role row: `padding: '0 36pt'`, centered
- Section body: `padding: '0 36pt'`, stacked `gap: '29pt'`
- Two-column item layout within sections: left mini-col `width: '101pt'`, then `borderLeft: '1px solid #ddd'`, then flex:1 content with `paddingLeft: '14pt'`

**Section header row (right col):**
- Flex row: `[25pt circle] [11pt gap] [h2 text] [flex:1 dotted line]`
- Circle: `width: 25pt`, `height: 25pt`, `borderRadius: 50%`, yellow bg
- Dotted line: `borderBottom: '3px dotted #fdb913'`, `opacity: 0.5`

**Photo frame (left col):**
- Outer wrapper: `padding: '0 20pt'`, `marginBottom: '22pt'`
- Inner arch: `backgroundColor: #fdb913`, `borderTopLeftRadius: '1.5in'`, `borderTopRightRadius: '1.5in'`, `height: '175pt'`, `padding: '14pt 14pt 0 14pt'`

---

## 5. Visual Signature Elements

### 1. Yellow Name Bar
Full-width yellow (`#fdb913`) strip spanning the right column. White uppercase name at 28pt with letterSpacing 2px. Visually the boldest element in the template.

### 2. Numbered Yellow Circle + Dotted Line Section Headers
Every right-column section begins with: a yellow filled circle (25pt diameter) containing a sequential integer, followed by the section title in 14pt uppercase bold, then a fading 3px dotted yellow line extending to the right edge. The `opacity: 0.5` on the dotted line creates depth without overwhelming.

### 3. Contact Icon Strip Tabs (Left Col)
Each contact item has a yellow pill-tab on the left edge of the sidebar (not inset by the column padding). The tab is `44pt` wide, right-rounded (`borderTopRightRadius: 15px`, `borderBottomRightRadius: 15px`), with a white SVG icon right-aligned inside it. The text label + value sits to the right.

### 4. Left-Col Pill Border Section Headers
Left column uses a different heading style: no numbered circles. Instead a `2px solid #fdb913` border with `borderRadius: 20px` wraps the uppercase section title. Creates a pill/badge-like look.

### 5. Date Chip
Each experience/education/project item has a small dark chip (`backgroundColor: #333`, `borderRadius: 2px`) showing the date or the word "Project". Sits in the left mini-column (101pt wide) above the company/institution name.

### 6. Two-Column Item Layout with Left Border
Each item in Experience / Education / Projects uses a flex row: a 101pt left mini-column (date chip + company name) and a content column separated by `borderLeft: '1px solid #ddd'`.

### 7. Arched Photo Frame
When a photo is provided, a yellow-background arch (`borderTopLeftRadius: '1.5in'`, `borderTopRightRadius: '1.5in'`) hosts the photo cropped to the top.

---

## 6. Section-by-Section Breakdown

### Contact Me (Left column)
- **Location:** Left column, top (after optional photo)
- **Section heading:** Pill-border h2 — `border: 2px solid #fdb913`, `borderRadius: 20px`, `padding: 0.08in 0`, `textAlign: center`, 12pt, bold, uppercase
- **Items:** Flex rows. Each has a yellow tab strip on the far left, then label (`10pt bold uppercase`) + value (`9pt #e0e0e0`)
- **Labels used:** `ADDRESS`, `WEB` (also shows email — mislabeled), `PHONE`
- **Portfolio/LinkedIn/additional links** are listed under the `WEB` item

### Skills (Left column)
- **Location:** Left column, below Contact
- **Section heading:** Same pill-border h2 as Contact
- **Items:** Category label (`10pt bold uppercase`) then bullet items (`9pt #e0e0e0`, prefixed with `•`). Languages shown as `Language (Proficiency)` joined by ` • `

### Profile / Summary (Right column, section #1)
- **Location:** Right column, first section
- **Heading:** Numbered circle + h2 + dotted line
- **Body:** `10pt`, `#555`, `lineHeight: 1.6`, plain `<p>` (not rich text)

### Education (Right column)
- **Location:** Right column
- **Heading:** Numbered circle + h2 + dotted line
- **Item layout:** Two-col flex — left mini-col (101pt) holds dark date chip + university name uppercase; right content area (borderLeft `1px solid #ddd`, `paddingLeft: 14pt`) holds degree title (`10pt bold uppercase #333`), then coursework (rich-text), GPA, honors in `9pt #666`

### Experience (Right column)
- **Location:** Right column
- **Heading:** Numbered circle + h2 + dotted line
- **Item layout:** Same two-col flex as Education — date chip + company name on left; role title (`10pt bold uppercase`) + responsibilities rich-text (`9pt #666`) on right

### Projects (Right column)
- **Location:** Right column
- **Heading:** Numbered circle + h2 + dotted line
- **Item layout:** Left mini-col shows a static "Project" chip (`#333`) + project role (`9pt bold uppercase #555`); right content: project name (`10pt bold uppercase #333`), description rich-text, technologies (italic `#888`), link (`9pt #888`)

### Certifications (Right column)
- **Location:** Right column
- **Heading:** Numbered circle + h2 + dotted line
- **Body:** Rich-text via `dangerouslySetInnerHTML`, `10pt #555 lineHeight 1.6`

### Activities / Extracurriculars (Right column)
- **Location:** Right column, last section
- **Heading:** Numbered circle + h2 + dotted line (title rendered as "Activities")
- **Body:** Rich-text, same style as Certifications

---

## 7. Current Design Limitations / Gaps

1. **Mislabeled contact section:** The email row uses `IconWeb` (globe icon) and the label "WEB" — email should use an envelope icon and "EMAIL" label.
2. **`sectionIndex` counter never resets between renders** — it starts at `1` correctly because it's initialized fresh each render, but the counter is a plain `let` rather than being tied to rendered sections. If sections are conditionally hidden, the numbering still increments and creates gaps (e.g. section 1, 3, 4 if Education is hidden).
3. **Left column has no bottom padding when no skills** — the column padding is `29pt 0`; if both Contact and Skills are empty, the left column is visually empty with no fallback.
4. **Icon tab strip can feel cramped at narrow widths** — the 44pt tab plus 11pt gap plus content text with 14pt right-padding inside a 38%-wide sidebar can make long emails/URLs overflow or wrap awkwardly.
5. **No visual hierarchy weight difference between section number and section title** — both the number (14pt bold) and the `h2` text (14pt bold) have the same size and weight; the circle only differentiates by color.
6. **Right column has no horizontal padding on the column div itself** — padding is applied inconsistently: name bar uses `padding: 11pt 36pt`, sections use `padding: 0 36pt`. This creates maintenance risk if a new element is added to the right col without matching padding.
7. **Summary is a plain `<p>` tag** — it does not support rich text formatting (no `dangerouslySetInnerHTML`), unlike Experience/Projects which do. Inconsistency with other templates.
8. **Two-column items have fixed 101pt left column** — long company names or date strings can overflow the fixed width and collide with the right content area.
9. **Projects always show a static "Project" chip** — unlike Experience/Education which show a meaningful date, Projects always display the word "Project" in the chip. Not very useful.
10. **No `width: '100%'` on outermost div** — the root div uses `minHeight: '100%'` and `display: flex` but lacks explicit `width: '100%'`. (The outer ResumePreview container sets `width: 8.5in` so it renders correctly, but it technically violates the template width convention.)

---

## 8. Technical Constraints (Must Not Break)

1. **Inline styles only** — no Tailwind classes, no external CSS files. The template renders inside Puppeteer for PDF generation; only inline styles and a single `<style>` tag are supported.
2. **`<style>` tag for `.rich-content`** — the existing `<style>` block for `.rich-content ul/ol/li/p` must be preserved. It is the only accepted CSS injection.
3. **`width: '100%'` and `minHeight: '100%'`** on outermost div — never use a fixed `width: '8.5in'`. The parent container (`ResumePreview`) already sets the page width.
4. **No external images or icon libraries** — SVG icons must be defined as inline React components (as already done for `IconLocation`, `IconWeb`, `IconPhone`). No `<img src="https://...">` for icons.
5. **`isEmptyRichText(html)`** — must be called before every `dangerouslySetInnerHTML` on a rich-text field. Never render raw `null`/`undefined` HTML.
6. **`data.profilePhoto`** — the photo field. It may be `undefined`/`null`; always guard with `data?.profilePhoto &&`.
7. **Props interface:** `{ data: ResumeFormData, isPreview?: boolean }` — no other props may be added.
8. **`isPreview` flag** — used exclusively for `boxShadow` on the outermost div. Keep this behaviour unchanged.
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
import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const IconLocation = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconWeb = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const ModernYellowSplit: React.FC<ResumeTemplateProps> = ({ data, isPreview }) => {
    const primaryColor = "#fdb913";
    const darkBg = "#2c2c2c";

    let sectionIndex = 1;

    return (
        <div style={{
            minHeight: '100%',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, Helvetica, sans-serif',
            display: 'flex',
            flexDirection: 'row',
            boxSizing: 'border-box',
            margin: '0 auto',
            boxShadow: isPreview ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
            color: '#333',
            lineHeight: 1.5,
        }}>
            <style>{`
              .rich-content ul { list-style-type: disc; padding-left: 16px; margin: 4px 0; }
              .rich-content ol { list-style-type: decimal; padding-left: 16px; margin: 4px 0; }
              .rich-content li { margin-bottom: 2px; }
              .rich-content p { margin: 0; }
            `}</style>
            {/* Left Column */}
            <div style={{
                width: '38%',
                backgroundColor: darkBg,
                color: '#ffffff',
                padding: '29pt 0',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Photo Area */}
                {data?.profilePhoto && (
                    <div style={{ padding: '0 20pt', marginBottom: '22pt' }}>
                        <div style={{
                            backgroundColor: primaryColor,
                            borderTopLeftRadius: '1.5in',
                            borderTopRightRadius: '1.5in',
                            padding: '14pt 14pt 0 14pt',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            height: '175pt',
                        }}>
                            <img
                                src={data.profilePhoto}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'top',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                {((data?.city || data?.country) || data?.email || data?.phone) && (
                    <div style={{ marginBottom: '22pt' }}>
                        <div style={{ padding: '0 20pt' }}>
                            <h2 style={{
                                border: `2px solid ${primaryColor}`,
                                borderRadius: '20px',
                                padding: '0.08in 0',
                                textAlign: 'center',
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                marginBottom: '0.3in',
                                textTransform: 'uppercase',
                                margin: '0 0 18pt 0'
                            }}>
                                Contact Me
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11pt' }}>
                            {/* Address */}
                            {(data?.city || data?.country) && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconLocation /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>ADDRESS</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>
                                            {data.city}{data.city && data.country ? ', ' : ''}{data.country}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Web / Email */}
                            {data?.email && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconWeb /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt', wordBreak: 'break-all' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>WEB</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>{data.email}</div>
                                        {data?.portfolioUrl && <div style={{ fontSize: '9pt', color: '#e0e0e0' }}>{data.portfolioUrl}</div>}
                                        {data?.linkedinUrl && <div style={{ fontSize: '9pt', color: '#e0e0e0' }}>{data.linkedinUrl}</div>}
                                        {(data.additionalLinks || []).filter((l) => l.url).map((l, i) => (
                                            <div key={i} style={{ fontSize: '9pt', color: '#e0e0e0' }}>
                                                {l.label ? `${l.label}: ${l.url}` : l.url}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {data?.phone && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconPhone /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>PHONE</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>{data.phone}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills Section */}
                {(data?.skills?.categories?.some((c) => c.items.length > 0) || data?.skills?.languages?.some((l) => l.language)) && (
                    <div style={{ padding: '0 20pt' }}>
                        <h2 style={{
                            border: `2px solid ${primaryColor}`,
                            borderRadius: '20px',
                            padding: '0.08in 0',
                            textAlign: 'center',
                            fontSize: '12pt',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            marginBottom: '0.3in',
                            textTransform: 'uppercase',
                            margin: '0 0 14pt 0'
                        }}>
                            Skills
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11pt' }}>
                            {data.skills.categories.filter((c) => c.category.trim() && c.items.length > 0).map((cat, index) => (
                                <div key={index} style={{ fontSize: '10pt' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{cat.category}</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '9pt', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {cat.items.map((item, i) => (
                                            <div key={i}>• {item}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {data.skills.languages.filter((l) => l.language).length > 0 && (
                                <div style={{ fontSize: '10pt' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Languages</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '9pt' }}>
                                        {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})`).join(' • ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div style={{
                flex: 1,
                padding: '36pt 0',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ marginBottom: '36pt' }}>
                    {data?.targetRole && (
                        <div style={{ padding: '0 36pt', textAlign: 'center', marginBottom: '7pt' }}>
                            <h3 style={{
                                fontSize: '14pt',
                                color: '#333',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontWeight: 'normal'
                            }}>
                                {data.targetRole}
                            </h3>
                        </div>
                    )}
                    {data?.fullName && (
                        <div style={{
                            backgroundColor: primaryColor,
                            padding: '11pt 36pt',
                            textAlign: 'center'
                        }}>
                            <h1 style={{
                                fontSize: '28pt',
                                color: '#fff',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                                {data.fullName}
                            </h1>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 36pt', display: 'flex', flexDirection: 'column', gap: '29pt' }}>

                    {/* Profile / Summary */}
                    {data?.professionalSummary && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Profile
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555', margin: 0 }}>
                                {data.professionalSummary}
                            </p>
                        </section>
                    )}

                    {/* Education */}
                    {data?.education && data.education.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Education
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            {edu.graduationDate && (
                                                <div style={{
                                                    backgroundColor: '#333',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    display: 'inline-block',
                                                    fontSize: '8pt',
                                                    fontWeight: 'bold',
                                                    borderRadius: '2px',
                                                    marginBottom: '4px'
                                                }}>
                                                    {edu.graduationDate}
                                                </div>
                                            )}
                                            {edu.university && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {edu.university}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {edu.degreeType} {edu.major ? `in ${edu.major}` : ''}
                                            </div>
                                            <div style={{ fontSize: '9pt', color: '#666', lineHeight: 1.5 }}>
                                                {!isEmptyRichText(edu.relevantCoursework) && (
                                                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: edu.relevantCoursework }} />
                                                )}
                                                {edu.gpa && <div style={{ marginTop: '2px' }}>GPA: {edu.gpa}</div>}
                                                {edu.honors && <div style={{ marginTop: '2px' }}>{edu.honors}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {data?.experience && data.experience.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Experience
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            {exp.duration && (
                                                <div style={{
                                                    backgroundColor: '#333',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    display: 'inline-block',
                                                    fontSize: '8pt',
                                                    fontWeight: 'bold',
                                                    borderRadius: '2px',
                                                    marginBottom: '4px'
                                                }}>
                                                    {exp.duration}
                                                </div>
                                            )}
                                            {exp.company && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {exp.company}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {exp.role}
                                            </div>
                                            {!isEmptyRichText(exp.responsibilities) && (
                                                <div className="rich-content" style={{ fontSize: '9pt', color: '#666', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: exp.responsibilities }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data?.projects && data.projects.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Projects
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            <div style={{
                                                backgroundColor: '#333',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                display: 'inline-block',
                                                fontSize: '8pt',
                                                fontWeight: 'bold',
                                                borderRadius: '2px',
                                                marginBottom: '4px'
                                            }}>
                                                Project
                                            </div>
                                            {proj.role && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {proj.role}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {proj.name}
                                            </div>
                                            <div style={{ fontSize: '9pt', color: '#666', lineHeight: 1.5 }}>
                                                {!isEmptyRichText(proj.description) && (
                                                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: proj.description }} />
                                                )}
                                                {proj.technologies && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#888' }}>Tech: {proj.technologies}</div>}
                                                {proj.link && (
                                                    <div style={{ marginTop: '4px', fontSize: '9pt', color: '#888' }}>
                                                        {proj.link}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {!isEmptyRichText(data?.certifications) && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Certifications
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <div className="rich-content" style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555' }} dangerouslySetInnerHTML={{ __html: data.certifications! }} />
                        </section>
                    )}

                    {/* Extracurriculars */}
                    {!isEmptyRichText(data?.extracurriculars) && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Activities
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <div className="rich-content" style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555' }} dangerouslySetInnerHTML={{ __html: data.extracurriculars! }} />
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ModernYellowSplit;
```
