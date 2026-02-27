import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const TERRA = '#d84315';
const TERRA_DARK = '#bf360c';
const TEXT = '#3e2723';
const BG_WARM = '#fff8e1';
const FONT = "'Open Sans', Verdana, sans-serif";
const SECTION_SPACING = '14pt';

export default function WarmCreativeTemplate({ data }: ResumeTemplateProps) {
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
      <h2 style={{ fontSize: '12pt', fontWeight: 'bold', color: TERRA_DARK, fontFamily: FONT, marginBottom: '4pt' }}>
        {formatHeading(title, 'titlecase')}
      </h2>
      <div style={{ borderBottom: `2px solid ${TERRA}`, marginBottom: '8pt' }} />
    </>
  );

  return (
    <div style={{ fontFamily: FONT, fontSize: '11pt', lineHeight: 1.5, color: TEXT }}>
      {/* ── Warm Header Band ── */}
      <div style={{ backgroundColor: TERRA, padding: '0.5in 0.75in', display: 'flex', alignItems: 'center', gap: '16pt' }}>
        {data.profilePhoto ? (
          <img
            src={data.profilePhoto}
            alt={data.fullName || 'Profile'}
            style={{ width: '75pt', height: '75pt', borderRadius: '50%', objectFit: 'cover', border: `3pt solid rgba(255,248,225,0.6)`, flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: '75pt', height: '75pt', borderRadius: '50%', backgroundColor: 'rgba(255,248,225,0.1)', border: '2pt dashed rgba(255,248,225,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28pt', color: 'rgba(255,248,225,0.6)', flexShrink: 0 }}>
            &#128100;
          </div>
        )}
        <div>
          {data.fullName && (
            <h1 style={{ fontSize: '23pt', fontWeight: 'bold', color: BG_WARM, marginBottom: '4pt' }}>
              {data.fullName}
            </h1>
          )}
          {contactLinks.length > 0 && (
            <div style={{ fontSize: '10.5pt', color: 'rgba(255,248,225,0.9)' }}>
              {contactLinks.join(' • ')}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '0.5in 0.75in' }}>
        {/* Summary */}
        {data.professionalSummary && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="About Me" />
            <p style={{ fontSize: '11pt', lineHeight: 1.5, color: TEXT }}>{data.professionalSummary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Experience" />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '10pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: TEXT }}>{exp.role}</div>
                <div style={{ fontSize: '11pt', color: TERRA, fontStyle: 'italic', marginTop: '1pt' }}>
                  {exp.company}{exp.duration && ` • ${exp.duration}`}
                </div>
                {exp.responsibilities && (
                  <ul style={{ fontSize: '11pt', color: TEXT, marginTop: '4pt', marginLeft: '16pt', listStyleType: 'disc' }}>
                    {parseResponsibilities(exp.responsibilities).map((item, j) => (
                      <li key={j} style={{ marginBottom: '2pt' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Creative Projects" />
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '6pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: TEXT }}>
                  {proj.name}
                  {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10.5pt', color: TERRA }}> • {proj.link}</span>}
                </div>
                {proj.technologies && <div style={{ fontSize: '10.5pt', color: TERRA, fontStyle: 'italic' }}>{proj.technologies}</div>}
                {proj.description && <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Education" />
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '6pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11.5pt', color: TEXT }}>
                  {edu.degreeType && edu.major ? `${edu.degreeType} in ${edu.major}` : edu.degreeType || edu.major}
                </div>
                <div style={{ fontSize: '11pt', color: TERRA }}>
                  {edu.university}{edu.graduationDate && ` • ${edu.graduationDate}`}
                </div>
                {edu.relevantCoursework && (
                  <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '2pt', fontStyle: 'italic' }}>
                    Coursework: {edu.relevantCoursework}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(data.skills.technical.length > 0 || data.skills.soft.length > 0 || data.skills.languages.some((l) => l.language)) && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SectionHeading title="Skills & Tools" />
            {data.skills.technical.map((cat, i) => (
              <div key={i} style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
                <span style={{ fontWeight: 'bold', color: TERRA_DARK }}>{cat.category}:</span>
                <span style={{ marginLeft: '5pt' }}>{(cat.items || []).join(', ')}</span>
              </div>
            ))}
            {data.skills.soft.length > 0 && (
              <div style={{ fontSize: '11pt', color: TEXT, marginBottom: '3pt' }}>
                <span style={{ fontWeight: 'bold', color: TERRA_DARK }}>Soft Skills:</span>
                <span style={{ marginLeft: '5pt' }}>{data.skills.soft.join(', ')}</span>
              </div>
            )}
            {data.skills.languages.some((l) => l.language) && (
              <div style={{ fontSize: '11pt', color: TEXT }}>
                <span style={{ fontWeight: 'bold', color: TERRA_DARK }}>Languages:</span>
                <span style={{ marginLeft: '5pt' }}>
                  {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Additional */}
        {(data.certifications || data.extracurriculars) && (
          <div>
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
            <p>Start filling in your information</p>
          </div>
        )}
      </div>
    </div>
  );
}
