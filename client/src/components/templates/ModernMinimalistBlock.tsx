// PDF-rendered: inline styles only
import { ResumeTemplateProps } from './types';

// Design tokens — aligned with design.json
const colors = {
  sidebarBg: '#454545',
  headerBlockBg: '#3b3434',
  mainBg: '#ffffff',
  onLight: '#222222',
  onLightMuted: '#555555',
  onDark: '#ffffff',
  onDarkMuted: '#cccccc',
  borderPrimary: '#333333',
};

const fonts = {
  primary: "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  secondary: "'Open Sans', 'Roboto', sans-serif",
};

// Typography scale from design.json
const fs = {
  h1: '1.875rem',   // name — fits single line at preview width
  h2: '1.25rem',    // section headers
  h3: '1rem',       // job titles
  body: '0.875rem', // body text
  meta: '0.75rem',  // dates, labels
};

// Spacing scale from design.json
const sp = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

export default function ModernMinimalistBlock({ data, isPreview }: ResumeTemplateProps) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: colors.mainBg,
      fontFamily: fonts.secondary,
      display: 'flex',
      flexDirection: 'row',
      boxSizing: 'border-box',
      boxShadow: isPreview ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
      overflow: 'hidden',
    }}>

      {/* ── Sidebar (35%) ─────────────────────────────────── */}
      <div style={{
        width: '35%',
        backgroundColor: colors.sidebarBg,
        padding: sp.xl,
        boxSizing: 'border-box',
        color: colors.onDarkMuted,
        display: 'flex',
        flexDirection: 'column',
        gap: sp.lg,
        flexShrink: 0,
      }}>

        {/* Profile Photo */}
        {data.profilePhoto && (
          <div>
            <img
              src={data.profilePhoto}
              alt={data.fullName}
              style={{
                width: '100%',
                aspectRatio: '3/4',
                objectFit: 'cover',
                borderRadius: '16px', // design.json borders.radius.imageContainer
                display: 'block',
              }}
            />
          </div>
        )}

        {/* Contact */}
        <div>
          <h2 style={{
            fontFamily: fonts.primary,
            fontSize: fs.h2,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.onDark,
            margin: `0 0 ${sp.sm} 0`,
            paddingBottom: sp.xs,
            borderBottom: `1px solid ${colors.onDarkMuted}`,
          }}>Contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: sp.sm, fontSize: fs.body, wordBreak: 'break-word' }}>
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {(data.city || data.country) && (
              <div>{[data.city, data.country].filter(Boolean).join(', ')}</div>
            )}
            {data.linkedinUrl && <div>{data.linkedinUrl}</div>}
            {data.portfolioUrl && <div>{data.portfolioUrl}</div>}
            {data.additionalLinks?.map(link => (
              <div key={link.id}>{link.label}: {link.url}</div>
            ))}
          </div>
        </div>

        {/* Technical Skills */}
        {data.skills?.technical?.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: fonts.primary,
              fontSize: fs.h2,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.onDark,
              margin: `0 0 ${sp.sm} 0`,
              paddingBottom: sp.xs,
              borderBottom: `1px solid ${colors.onDarkMuted}`,
            }}>Technical Skills</h2>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: fs.body }}>
              {data.skills.technical.map((tech, i) => (
                <div key={i}>
                  <div style={{ fontWeight: 'bold', color: colors.onDark, marginBottom: '2pt' }}>{tech.category}</div>
                  <ul style={{ margin: '0 0 8pt 0', paddingLeft: '14pt', listStyleType: 'disc' }}>
                    {tech.items?.map((item, j) => (
                      <li key={j} style={{ color: colors.onDark, opacity: 0.85, fontSize: fs.body, lineHeight: 1.6 }}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {data.skills?.soft?.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: fonts.primary,
              fontSize: fs.h2,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.onDark,
              margin: `0 0 ${sp.sm} 0`,
              paddingBottom: sp.xs,
              borderBottom: `1px solid ${colors.onDarkMuted}`,
            }}>Soft Skills</h2>
            <ul style={{ margin: 0, paddingLeft: '14pt', listStyleType: 'disc', fontSize: fs.body }}>
              {data.skills.soft.map((item, j) => (
                <li key={j} style={{ color: colors.onDark, opacity: 0.85, lineHeight: 1.6 }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Languages */}
        {data.skills?.languages?.filter(l => l.language).length > 0 && (
          <div>
            <h2 style={{
              fontFamily: fonts.primary,
              fontSize: fs.h2,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.onDark,
              margin: `0 0 ${sp.sm} 0`,
              paddingBottom: sp.xs,
              borderBottom: `1px solid ${colors.onDarkMuted}`,
            }}>Languages</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: sp.xs, fontSize: fs.body }}>
              {data.skills.languages.filter(l => l.language).map((lang, i) => (
                <div key={i}>
                  <strong style={{ color: colors.onDark }}>{lang.language}</strong>
                  {` — ${lang.proficiency}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content (65%) ────────────────────────────── */}
      <div style={{
        width: '65%',
        padding: sp.xl,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: sp.lg,
      }}>

        {/* Name + Role header */}
        <div>
          <h1 style={{
            fontFamily: fonts.primary,
            fontSize: fs.h1,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.onLight,
            margin: `0 0 ${sp.xs} 0`,
            lineHeight: 1.1,
          }}>{data.fullName}</h1>
          <div style={{
            fontFamily: fonts.primary,
            fontSize: fs.h3,
            fontWeight: 700,
            color: colors.onLightMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {data.targetRole}
          </div>
        </div>

        {/* Summary — boxed per design.json contentBox */}
        {data.professionalSummary && (
          <div style={{
            border: `2px solid ${colors.borderPrimary}`,
            padding: sp.md,
            fontSize: fs.body,
            lineHeight: 1.6,
            color: colors.onLightMuted,
          }}>
            {data.professionalSummary}
          </div>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <div>
            <SectionHeader title="Experience" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: sp.md }}>
              {data.experience.map((exp, i) => (
                <div key={i} style={{
                  borderLeft: `1px solid ${colors.borderPrimary}`,
                  paddingLeft: sp.md,
                  marginLeft: sp.xs,
                  position: 'relative',
                }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-5px',
                    top: '6px',
                    width: '9px',
                    height: '9px',
                    backgroundColor: colors.borderPrimary,
                    borderRadius: '50%',
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: sp.xs }}>
                    <div>
                      <div style={{ fontFamily: fonts.primary, fontSize: fs.h3, fontWeight: 700, color: colors.onLight }}>
                        {exp.role}
                      </div>
                      <div style={{ fontSize: fs.body, fontWeight: 600, color: colors.onLightMuted }}>
                        {exp.company}
                      </div>
                    </div>
                    <div style={{ fontSize: fs.meta, fontWeight: 600, color: colors.onLightMuted, whiteSpace: 'nowrap', marginLeft: sp.sm }}>
                      {exp.duration}
                    </div>
                  </div>
                  <ul style={{ margin: `${sp.xs} 0 0 0`, paddingLeft: sp.md, fontSize: fs.body, lineHeight: 1.6, color: colors.onLightMuted }}>
                    {exp.responsibilities?.split('\n').map((item, j) => {
                      const clean = item.replace(/^[•\-]\s*/, '').trim();
                      if (!clean) return null;
                      return <li key={j} style={{ marginBottom: sp.xs }}>{clean}</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <div>
            <SectionHeader title="Projects" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: sp.md }}>
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: sp.xs }}>
                    <div style={{ fontFamily: fonts.primary, fontSize: fs.h3, fontWeight: 700, color: colors.onLight }}>
                      {proj.name}
                      {proj.link && (
                        <span style={{ fontSize: fs.meta, fontWeight: 400, fontFamily: fonts.secondary }}>
                          {' '}| {proj.link}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: fs.meta, fontWeight: 600, color: colors.onLightMuted, marginLeft: sp.sm }}>
                      {proj.role}
                    </div>
                  </div>
                  <div style={{ fontSize: fs.body, lineHeight: 1.6, color: colors.onLightMuted, marginBottom: sp.xs }}>
                    {proj.description}
                  </div>
                  <div style={{ fontSize: fs.meta, color: colors.onLightMuted, fontStyle: 'italic' }}>
                    Technologies: {proj.technologies}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education?.filter(e => e.university || e.degreeType).length > 0 && (
          <div>
            <SectionHeader title="Education" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: sp.md }}>
              {data.education.filter(e => e.university || e.degreeType).map((edu, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: sp.xs }}>
                    <div style={{ fontFamily: fonts.primary, fontSize: fs.h3, fontWeight: 700, color: colors.onLight }}>
                      {edu.university}
                    </div>
                    <div style={{ fontSize: fs.meta, fontWeight: 600, color: colors.onLightMuted, marginLeft: sp.sm }}>
                      {edu.graduationDate}
                    </div>
                  </div>
                  <div style={{ fontSize: fs.body, color: colors.onLightMuted }}>
                    {edu.degreeType} in {edu.major}
                  </div>
                  {edu.gpa && (
                    <div style={{ fontSize: fs.meta, color: colors.onLightMuted, marginTop: sp.xs }}>
                      GPA: {edu.gpa}
                    </div>
                  )}
                  {edu.relevantCoursework && (
                    <div style={{ fontSize: fs.meta, color: colors.onLightMuted, marginTop: sp.xs }}>
                      Coursework: {edu.relevantCoursework}
                    </div>
                  )}
                  {edu.honors && (
                    <div style={{ fontSize: fs.meta, color: colors.onLightMuted, marginTop: sp.xs }}>
                      Honors: {edu.honors}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional */}
        {(data.certifications || data.extracurriculars) && (
          <div>
            <SectionHeader title="Additional Information" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: sp.sm }}>
              {data.certifications && (
                <div>
                  <strong style={{ color: colors.onLight, fontSize: fs.body }}>Certifications:</strong>
                  <div style={{ fontSize: fs.body, color: colors.onLightMuted, marginTop: sp.xs, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {data.certifications}
                  </div>
                </div>
              )}
              {data.extracurriculars && (
                <div>
                  <strong style={{ color: colors.onLight, fontSize: fs.body }}>Extracurriculars:</strong>
                  <div style={{ fontSize: fs.body, color: colors.onLightMuted, marginTop: sp.xs, whiteSpace: 'pre-line', lineHeight: 1.5 }}>
                    {data.extracurriculars}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Dark block section header — design.json sectionBlockHeader pattern
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      backgroundColor: colors.headerBlockBg,
      padding: '4px 12px',
      display: 'inline-block',
      marginBottom: '12px',
    }}>
      <h2 style={{
        fontFamily: fonts.primary,
        fontSize: fs.h2,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: colors.onDark,
        margin: 0,
      }}>{title}</h2>
    </div>
  );
}
