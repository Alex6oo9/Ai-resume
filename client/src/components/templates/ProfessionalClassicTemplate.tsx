import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const NAVY = '#1e3a5f';
const GOLD = '#c9a84c';
const TEXT = '#1a1a1a';
const FONT = "'Times New Roman', Times, Georgia, serif";
const SECTION_SPACING = '16pt';

export default function ProfessionalClassicTemplate({ data }: ResumeTemplateProps) {
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
      <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: NAVY, fontFamily: FONT, letterSpacing: '0.04em', marginBottom: '4pt' }}>
        {formatHeading(title, 'titlecase')}
      </h2>
      <div style={{ borderBottom: `2px solid ${GOLD}`, marginBottom: '10pt' }} />
    </>
  );

  return (
    <div style={{ fontFamily: FONT, fontSize: '11pt', lineHeight: 1.5, color: TEXT, padding: '0.85in' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: SECTION_SPACING }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20pt', marginBottom: '8pt' }}>
          {data.profilePhoto && (
            <img
              src={data.profilePhoto}
              alt={data.fullName || 'Profile'}
              style={{ width: '80pt', height: '80pt', borderRadius: '50%', objectFit: 'cover', border: `3pt solid ${GOLD}`, flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1 }}>
            {data.fullName && (
              <h1 style={{ fontSize: '26pt', fontWeight: 'bold', color: NAVY, fontFamily: FONT, letterSpacing: '0.03em', marginBottom: '4pt' }}>
                {data.fullName}
              </h1>
            )}
            {data.targetRole && (
              <div style={{ fontSize: '12pt', color: GOLD, fontStyle: 'italic', marginBottom: '4pt' }}>
                {data.targetRole}
              </div>
            )}
          </div>
        </div>
        {contactLinks.length > 0 && (
          <div style={{ textAlign: data.profilePhoto ? 'left' : 'center', fontSize: '10.5pt', color: '#555', borderTop: `1px solid ${GOLD}`, paddingTop: '6pt' }}>
            {contactLinks.join(' • ')}
          </div>
        )}
      </div>

      {/* ── Summary ── */}
      {data.professionalSummary && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Professional Summary" />
          <p style={{ fontSize: '11pt', lineHeight: 1.5, color: TEXT }}>{data.professionalSummary}</p>
        </div>
      )}

      {/* ── Experience ── */}
      {data.experience.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Professional Experience" />
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '10pt' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8pt' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: NAVY }}>{exp.role}</div>
                {exp.duration && <div style={{ fontSize: '10.5pt', color: '#666', flexShrink: 0 }}>{exp.duration}</div>}
              </div>
              <div style={{ fontSize: '11pt', color: '#444', fontStyle: 'italic', marginTop: '1pt' }}>
                {exp.company}
              </div>
              {exp.responsibilities && (
                <ul style={{ fontSize: '11pt', color: TEXT, marginTop: '4pt', marginLeft: '18pt', listStyleType: 'disc' }}>
                  {parseResponsibilities(exp.responsibilities).map((item, j) => (
                    <li key={j} style={{ marginBottom: '2pt' }}>{item}</li>
                  ))}
                </ul>
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
            <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '8pt' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: NAVY }}>
                  {edu.degreeType && edu.major ? `${edu.degreeType} in ${edu.major}` : edu.degreeType || edu.major}
                </div>
                {edu.graduationDate && <div style={{ fontSize: '10.5pt', color: '#666', flexShrink: 0 }}>{edu.graduationDate}</div>}
              </div>
              <div style={{ fontSize: '11pt', color: '#444', fontStyle: 'italic' }}>{edu.university}</div>
              {edu.relevantCoursework && (
                <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '2pt' }}>
                  <span style={{ fontStyle: 'italic' }}>Relevant Coursework:</span> {edu.relevantCoursework}
                </div>
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
              <span style={{ fontWeight: 'bold', color: NAVY }}>{cat.category}:</span>
              <span style={{ marginLeft: '6pt' }}>{(cat.items || []).join(', ')}</span>
            </div>
          ))}
          {data.skills.soft.length > 0 && (
            <div style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
              <span style={{ fontWeight: 'bold', color: NAVY }}>Soft Skills:</span>
              <span style={{ marginLeft: '6pt' }}>{data.skills.soft.join(', ')}</span>
            </div>
          )}
          {data.skills.languages.some((l) => l.language) && (
            <div style={{ fontSize: '11pt', color: TEXT }}>
              <span style={{ fontWeight: 'bold', color: NAVY }}>Languages:</span>
              <span style={{ marginLeft: '6pt' }}>
                {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Projects ── */}
      {data.projects.length > 0 && (
        <div style={{ marginBottom: SECTION_SPACING }}>
          <SectionHeading title="Projects" />
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '6pt' : 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: NAVY }}>
                {proj.name}
                {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10.5pt', color: '#555' }}> • {proj.link}</span>}
              </div>
              {proj.technologies && (
                <div style={{ fontSize: '10.5pt', color: '#555', fontStyle: 'italic' }}>{proj.technologies}</div>
              )}
              {proj.description && (
                <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Additional ── */}
      {(data.certifications || data.extracurriculars) && (
        <div>
          {data.certifications && (
            <div style={{ marginBottom: data.extracurriculars ? '10pt' : 0 }}>
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
          <p>Start filling in your information</p>
        </div>
      )}
    </div>
  );
}
