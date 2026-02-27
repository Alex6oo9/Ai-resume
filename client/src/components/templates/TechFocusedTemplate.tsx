import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const DARK = '#0f172a';
const SKY = '#0ea5e9';
const TEXT = '#0f172a';
const MUTED = '#475569';
const FONT_BODY = 'Inter, system-ui, Arial, sans-serif';
const FONT_HEADING = "'JetBrains Mono', 'Fira Code', 'Courier New', monospace";
const SECTION_SPACING = '10pt';

export default function TechFocusedTemplate({ data }: ResumeTemplateProps) {
  const location = [data.city, data.country].filter(Boolean).join(', ');
  const contactLinks = [
    data.email,
    data.phone,
    location,
    data.linkedinUrl,
    data.portfolioUrl,
    ...(data.additionalLinks || []).filter((l) => l.url).map((l) => {
      const label = l.label || 'Link';
      return `${label}: ${l.url}`;
    }),
  ].filter(Boolean) as string[];

  const SectionHeading = ({ title }: { title: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', marginBottom: '8pt' }}>
      <h2 style={{ fontSize: '11.5pt', fontWeight: 'bold', color: DARK, fontFamily: FONT_HEADING, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {formatHeading(title, 'uppercase')}
      </h2>
      <div style={{ flex: 1, height: '1.5px', backgroundColor: SKY }} />
    </div>
  );

  return (
    <div style={{ fontFamily: FONT_BODY, fontSize: '10.5pt', lineHeight: 1.3, color: TEXT, padding: '0.65in' }}>
      {/* ── Header (no photo) ── */}
      <div style={{ marginBottom: '12pt', borderBottom: `2px solid ${SKY}`, paddingBottom: '10pt' }}>
        {data.fullName && (
          <h1 style={{ fontSize: '20pt', fontWeight: 'bold', color: DARK, fontFamily: FONT_HEADING, letterSpacing: '0.04em', marginBottom: '4pt' }}>
            {data.fullName}
          </h1>
        )}
        {data.targetRole && (
          <div style={{ fontSize: '11pt', color: SKY, fontFamily: FONT_HEADING, marginBottom: '4pt' }}>
            {data.targetRole}
          </div>
        )}
        {contactLinks.length > 0 && (
          <div style={{ fontSize: '10pt', color: MUTED }}>{contactLinks.join(' • ')}</div>
        )}
      </div>

      {/* ── Skills (first) ── */}
      {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.languages.some((l) => l.language)) && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Technical Skills" />
          {data.skills.technical.map((cat, i) => (
            <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '3pt', fontSize: '10.5pt', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: SKY, fontFamily: FONT_HEADING, flexShrink: 0 }}>{cat.category}:</span>
              <span style={{ color: TEXT }}>{(cat.items || []).join(' • ')}</span>
            </div>
          ))}
          {data.skills.soft.length > 0 && (
            <div style={{ display: 'flex', gap: '6pt', marginBottom: '3pt', fontSize: '10.5pt', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: SKY, fontFamily: FONT_HEADING, flexShrink: 0 }}>Soft:</span>
              <span style={{ color: TEXT }}>{data.skills.soft.join(' • ')}</span>
            </div>
          )}
          {data.skills.languages.some((l) => l.language) && (
            <div style={{ display: 'flex', gap: '6pt', fontSize: '10.5pt', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: SKY, fontFamily: FONT_HEADING, flexShrink: 0 }}>Languages:</span>
              <span style={{ color: TEXT }}>
                {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Experience ── */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Experience" />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '8pt' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8pt' }}>
                <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: DARK }}>{exp.role}</div>
                {exp.duration && <div style={{ fontSize: '10pt', color: MUTED, flexShrink: 0, fontFamily: FONT_HEADING }}>{exp.duration}</div>}
              </div>
              <div style={{ fontSize: '10.5pt', color: SKY, marginTop: '1pt' }}>{exp.company}</div>
              {exp.responsibilities && (
                <ul style={{ fontSize: '10.5pt', color: TEXT, marginTop: '3pt', marginLeft: '16pt', listStyleType: 'square' }}>
                  {parseResponsibilities(exp.responsibilities).map((item, j) => (
                    <li key={j} style={{ marginBottom: '2pt' }}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Projects" />
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '6pt' : 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: DARK }}>
                {proj.name}
                {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10pt', color: SKY }}> | {proj.link}</span>}
              </div>
              {proj.technologies && (
                <div style={{ fontSize: '10pt', color: SKY, fontFamily: FONT_HEADING }}>{proj.technologies}</div>
              )}
              {proj.description && (
                <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Education" />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '6pt' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: DARK }}>
                  {edu.degreeType && edu.major ? `${edu.degreeType} in ${edu.major}` : edu.degreeType || edu.major}
                </div>
                {edu.graduationDate && <div style={{ fontSize: '10pt', color: MUTED, flexShrink: 0 }}>{edu.graduationDate}</div>}
              </div>
              <div style={{ fontSize: '10.5pt', color: MUTED }}>{edu.university}</div>
              {edu.relevantCoursework && (
                <div style={{ fontSize: '10pt', color: TEXT, marginTop: '2pt', fontStyle: 'italic' }}>
                  Coursework: {edu.relevantCoursework}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Summary ── */}
      {data.professionalSummary && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Summary" />
          <p style={{ fontSize: '10.5pt', lineHeight: 1.4, color: TEXT }}>{data.professionalSummary}</p>
        </div>
      )}

      {/* ── Additional ── */}
      {(data.certifications || data.extracurriculars) && (
        <div>
          {data.certifications && (
            <div style={{ marginBottom: data.extracurriculars ? '8pt' : 0 }}>
              <SectionHeading title="Certifications" />
              <div style={{ fontSize: '10.5pt', color: TEXT }}>{data.certifications}</div>
            </div>
          )}
          {data.extracurriculars && (
            <>
              <SectionHeading title="Activities" />
              <div style={{ fontSize: '10.5pt', color: TEXT }}>{data.extracurriculars}</div>
            </>
          )}
        </div>
      )}

      {!data.fullName && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32pt' }}>
          <p>Start filling in your information</p>
        </div>
      )}
    </div>
  );
}
