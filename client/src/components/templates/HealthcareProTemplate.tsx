import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const TEAL = '#0f766e';
const TEAL_LIGHT = '#14b8a6';
const TEXT = '#2c2c2c';
const FONT = 'Lato, Arial, sans-serif';
const SECTION_SPACING = '13pt';

export default function HealthcareProTemplate({ data }: ResumeTemplateProps) {
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
      <h2 style={{ fontSize: '12pt', fontWeight: 'bold', color: TEAL, fontFamily: FONT, marginBottom: '4pt' }}>
        {formatHeading(title, 'titlecase')}
      </h2>
      <div style={{ borderBottom: `1px solid ${TEAL_LIGHT}`, marginBottom: '8pt' }} />
    </>
  );

  return (
    <div style={{ fontFamily: FONT, fontSize: '11pt', lineHeight: 1.45, color: TEXT }}>
      {/* ── Teal Header Band ── */}
      <div style={{ backgroundColor: TEAL, padding: '0.5in 0.7in', display: 'flex', alignItems: 'center', gap: '16pt' }}>
        {data.profilePhoto ? (
          <img
            src={data.profilePhoto}
            alt={data.fullName || 'Profile'}
            style={{ width: '75pt', height: '75pt', borderRadius: '50%', objectFit: 'cover', border: '3pt solid rgba(255,255,255,0.5)', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: '75pt', height: '75pt', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.12)', border: '2pt dashed rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28pt', color: 'rgba(255,255,255,0.6)', flexShrink: 0 }}>
            &#128100;
          </div>
        )}
        <div>
          {data.fullName && (
            <h1 style={{ fontSize: '22pt', fontWeight: 'bold', color: '#ffffff', marginBottom: '4pt' }}>
              {data.fullName}
            </h1>
          )}
          {contactLinks.length > 0 && (
            <div style={{ fontSize: '10.5pt', color: 'rgba(255,255,255,0.85)' }}>
              {contactLinks.join(' • ')}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '0.45in 0.7in' }}>
        {/* Summary */}
        {data.professionalSummary && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Professional Summary" />
            <p style={{ fontSize: '11pt', lineHeight: 1.45, color: TEXT }}>{data.professionalSummary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Clinical Experience" />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '8pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>{exp.role}</div>
                <div style={{ fontSize: '11pt', color: TEAL, marginTop: '1pt' }}>
                  {exp.company}{exp.duration && ` • ${exp.duration}`}
                </div>
                {exp.responsibilities && (
                  <ul style={{ fontSize: '11pt', color: TEXT, marginTop: '4pt', marginLeft: '16pt', listStyleType: 'circle' }}>
                    {parseResponsibilities(exp.responsibilities).map((item, j) => (
                      <li key={j} style={{ marginBottom: '2pt' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Education & Training" />
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '6pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>
                  {edu.degreeType && edu.major ? `${edu.degreeType} in ${edu.major}` : edu.degreeType || edu.major}
                </div>
                <div style={{ fontSize: '11pt', color: TEAL }}>
                  {edu.university}{edu.graduationDate && ` • ${edu.graduationDate}`}
                </div>
                {edu.relevantCoursework && (
                  <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '2pt', fontStyle: 'italic' }}>
                    {edu.relevantCoursework}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Additional (certifications first for healthcare) */}
        {data.certifications && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Certifications & Licenses" />
            <div style={{ fontSize: '11pt', color: TEXT }}>{data.certifications}</div>
          </div>
        )}

        {/* Skills */}
        {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.languages.some((l) => l.language)) && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Skills & Competencies" />
            {data.skills.technical.map((cat, i) => (
              <div key={i} style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
                <span style={{ fontWeight: 'bold', color: TEAL }}>{cat.category}:</span>
                <span style={{ marginLeft: '5pt' }}>{(cat.items || []).join(', ')}</span>
              </div>
            ))}
            {data.skills.soft.length > 0 && (
              <div style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
                <span style={{ fontWeight: 'bold', color: TEAL }}>Soft Skills:</span>
                <span style={{ marginLeft: '5pt' }}>{data.skills.soft.join(', ')}</span>
              </div>
            )}
            {data.skills.languages.some((l) => l.language) && (
              <div style={{ fontSize: '11pt', color: TEXT }}>
                <span style={{ fontWeight: 'bold', color: TEAL }}>Languages:</span>
                <span style={{ marginLeft: '5pt' }}>
                  {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Research & Projects" />
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '6pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>
                  {proj.name}
                  {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10.5pt', color: TEAL }}> • {proj.link}</span>}
                </div>
                {proj.technologies && <div style={{ fontSize: '10.5pt', color: TEXT, fontStyle: 'italic' }}>{proj.technologies}</div>}
                {proj.description && <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}

        {data.extracurriculars && (
          <div>
            <SectionHeading title="Extracurricular Activities" />
            <div style={{ fontSize: '11pt', color: TEXT }}>{data.extracurriculars}</div>
          </div>
        )}

        {!data.fullName && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32pt' }}>
            <p>Start filling in your information</p>
          </div>
        )}
      </div>
    </div>
  );
}
