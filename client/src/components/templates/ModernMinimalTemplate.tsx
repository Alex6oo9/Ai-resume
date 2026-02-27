import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const ACCENT = '#2563eb';
const HEADING_COLOR = '#1e40af';
const TEXT = '#1a1a1a';
const FONT = 'Inter, Roboto, system-ui, Arial, sans-serif';
const SECTION_SPACING = '14pt';

export default function ModernMinimalTemplate({ data }: ResumeTemplateProps) {
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
    <>
      <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: HEADING_COLOR, marginBottom: '4pt', fontFamily: FONT }}>
        {formatHeading(title, 'titlecase')}
      </h2>
      <div style={{ borderBottom: `2px solid ${ACCENT}`, marginBottom: '8pt' }} />
    </>
  );

  return (
    <div style={{ fontFamily: FONT, fontSize: '11pt', lineHeight: 1.4, color: TEXT, padding: '0.75in' }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16pt', marginBottom: SECTION_SPACING }}>
        {data.profilePhoto && (
          <img
            src={data.profilePhoto}
            alt={data.fullName || 'Profile'}
            style={{ width: '72pt', height: '72pt', borderRadius: '50%', objectFit: 'cover', border: `2pt solid ${ACCENT}`, flexShrink: 0 }}
          />
        )}
        <div>
          {data.fullName && (
            <h1 style={{ fontSize: '20pt', fontWeight: 'bold', color: HEADING_COLOR, marginBottom: '4pt' }}>
              {data.fullName}
            </h1>
          )}
          {contactLinks.length > 0 && (
            <div style={{ fontSize: '10.5pt', color: TEXT }}>{contactLinks.join(' • ')}</div>
          )}
        </div>
      </div>

      {/* ── Summary ── */}
      {data.professionalSummary && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Professional Summary" />
          <p style={{ fontSize: '11pt', lineHeight: 1.4, color: TEXT }}>{data.professionalSummary}</p>
        </div>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Education" />
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '6pt' : 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>
                {edu.degreeType && edu.major
                  ? `${edu.degreeType} in ${edu.major}`
                  : edu.degreeType || edu.major}
              </div>
              <div style={{ fontSize: '11pt', color: TEXT }}>
                {edu.university}{edu.graduationDate && ` • ${edu.graduationDate}`}
              </div>
              {edu.relevantCoursework && (
                <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt', fontStyle: 'italic' }}>
                  Relevant Coursework: {edu.relevantCoursework}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Experience ── */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Experience" />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '8pt' : 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>{exp.role}</div>
              <div style={{ fontSize: '11pt', color: TEXT }}>
                {exp.company}{exp.duration && ` • ${exp.duration}`}
              </div>
              {exp.responsibilities && (
                <ul style={{ fontSize: '11pt', color: TEXT, marginTop: '4pt', marginLeft: '18pt', listStyleType: 'circle' }}>
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
              <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>
                {proj.name}
                {proj.link && (
                  <span style={{ fontWeight: 'normal', fontSize: '10.5pt' }}> • {proj.link}</span>
                )}
              </div>
              {proj.technologies && (
                <div style={{ fontSize: '10.5pt', color: TEXT, fontStyle: 'italic' }}>{proj.technologies}</div>
              )}
              {proj.description && (
                <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ── */}
      {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.languages.some((l) => l.language)) && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Skills" />
          {data.skills.technical.map((cat, i) => (
            <div key={i} style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
              <span style={{ fontWeight: 'bold' }}>{cat.category}:</span>
              <span style={{ marginLeft: '4pt' }}>{(cat.items || []).join(', ')}</span>
            </div>
          ))}
          {data.skills.soft.length > 0 && (
            <div style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
              <span style={{ fontWeight: 'bold' }}>Soft Skills:</span>
              <span style={{ marginLeft: '4pt' }}>{data.skills.soft.join(', ')}</span>
            </div>
          )}
          {data.skills.languages.some((l) => l.language) && (
            <div style={{ fontSize: '11pt', color: TEXT }}>
              <span style={{ fontWeight: 'bold' }}>Languages:</span>
              <span style={{ marginLeft: '4pt' }}>
                {data.skills.languages
                  .filter((l) => l.language)
                  .map((l) => `${l.language} (${l.proficiency})`)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Additional ── */}
      {(data.certifications || data.extracurriculars) && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          {data.certifications && (
            <div style={{ marginBottom: data.extracurriculars ? '8pt' : 0 }}>
              <SectionHeading title="Certifications" />
              <div style={{ fontSize: '11pt', color: TEXT }}>{data.certifications}</div>
            </div>
          )}
          {data.extracurriculars && (
            <>
              <SectionHeading title="Extracurricular Activities" />
              <div style={{ fontSize: '11pt', color: TEXT }}>{data.extracurriculars}</div>
            </>
          )}
        </div>
      )}

      {!data.fullName && (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32pt' }}>
          <p style={{ fontSize: '11pt' }}>Start filling in your information</p>
          <p style={{ fontSize: '10pt', marginTop: '4pt' }}>Your resume will appear here in real-time</p>
        </div>
      )}
    </div>
  );
}
