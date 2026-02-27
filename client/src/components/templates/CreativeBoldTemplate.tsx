import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const SIDEBAR_BG = '#7c3aed';
const SIDEBAR_FG = '#ffffff';
const ACCENT = '#7c3aed';
const HEADING_COLOR = '#4c1d95';
const TEXT = '#1f1f2e';
const BODY_FONT = 'Lato, Arial, sans-serif';
const HEADING_FONT = "'Playfair Display', Georgia, serif";
const SECTION_SPACING = '14pt';

function SidebarHeading({ title }: { title: string }) {
  return (
    <>
      <h2 style={{ fontSize: '11pt', fontWeight: 'bold', color: SIDEBAR_FG, fontFamily: HEADING_FONT, marginBottom: '4pt', letterSpacing: '0.05em' }}>
        {formatHeading(title, 'uppercase')}
      </h2>
      <div style={{ borderBottom: `1px solid rgba(255,255,255,0.4)`, marginBottom: '8pt' }} />
    </>
  );
}

function MainHeading({ title }: { title: string }) {
  return (
    <>
      <h2 style={{ fontSize: '13pt', fontWeight: 'bold', color: HEADING_COLOR, fontFamily: HEADING_FONT, marginBottom: '4pt' }}>
        {formatHeading(title, 'titlecase')}
      </h2>
      <div style={{ borderBottom: `2px solid ${ACCENT}`, marginBottom: '8pt' }} />
    </>
  );
}

export default function CreativeBoldTemplate({ data }: ResumeTemplateProps) {
  const location = [data.city, data.country].filter(Boolean).join(', ');
  const contactItems = [
    data.phone && { label: '☎', value: data.phone },
    data.email && { label: '✉', value: data.email },
    location && { label: '⌖', value: location },
    data.linkedinUrl && { label: '⊕', value: data.linkedinUrl },
    data.portfolioUrl && { label: '⊕', value: data.portfolioUrl },
    ...(data.additionalLinks || []).filter((l) => l.url).map((l) => ({ label: '⊕', value: l.url })),
  ].filter(Boolean) as { label: string; value: string }[];

  const skillItems: string[] = [];
  data.skills.technical.forEach((cat) => (cat.items || []).forEach((item) => item.trim() && skillItems.push(item.trim())));
  data.skills.soft.forEach((s) => s.trim() && skillItems.push(s.trim()));

  return (
    <div style={{ fontFamily: BODY_FONT, fontSize: '11pt', color: TEXT, display: 'flex', minHeight: '100%' }}>
      {/* ── Left Sidebar ── */}
      <div style={{ width: '38%', flexShrink: 0, backgroundColor: SIDEBAR_BG, color: SIDEBAR_FG, padding: '0.6in 0.4in', display: 'flex', flexDirection: 'column' }}>
        {/* Photo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20pt' }}>
          {data.profilePhoto ? (
            <img
              src={data.profilePhoto}
              alt={data.fullName || 'Profile'}
              style={{ width: '90pt', height: '90pt', borderRadius: '50%', objectFit: 'cover', border: '3pt solid rgba(255,255,255,0.5)' }}
            />
          ) : (
            <div style={{ width: '90pt', height: '90pt', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '2pt dashed rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36pt', color: 'rgba(255,255,255,0.5)' }}>
              &#128100;
            </div>
          )}
        </div>

        {/* Name in sidebar */}
        {data.fullName && (
          <div style={{ marginBottom: '20pt', textAlign: 'center' }}>
            <div style={{ fontSize: '18pt', fontWeight: 'bold', color: SIDEBAR_FG, fontFamily: HEADING_FONT, lineHeight: 1.2 }}>
              {data.fullName}
            </div>
            {data.targetRole && (
              <div style={{ fontSize: '10pt', color: 'rgba(255,255,255,0.8)', marginTop: '4pt', fontStyle: 'italic' }}>
                {data.targetRole}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {contactItems.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SidebarHeading title="Contact" />
            {contactItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '4pt', fontSize: '10pt', color: SIDEBAR_FG, wordBreak: 'break-all' }}>
                <span style={{ flexShrink: 0, opacity: 0.75 }}>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {(skillItems.length > 0 || data.skills.languages.some((l) => l.language)) && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <SidebarHeading title="Skills" />
            {skillItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '3pt', fontSize: '10pt', color: SIDEBAR_FG }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{item}</span>
              </div>
            ))}
            {data.skills.languages.some((l) => l.language) && (
              <div style={{ marginTop: '8pt' }}>
                <SidebarHeading title="Languages" />
                {data.skills.languages.filter((l) => l.language).map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '3pt', fontSize: '10pt', color: SIDEBAR_FG }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <span>{l.language}{l.proficiency && l.proficiency !== 'native' ? ` (${l.proficiency})` : ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Education in sidebar */}
        {data.education.length > 0 && (
          <div>
            <SidebarHeading title="Education" />
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '8pt' : 0 }}>
                {edu.graduationDate && (
                  <div style={{ fontSize: '9.5pt', color: 'rgba(255,255,255,0.75)', marginBottom: '2pt' }}>{edu.graduationDate}</div>
                )}
                <div style={{ fontSize: '10pt', fontWeight: 'bold', color: SIDEBAR_FG, textTransform: 'uppercase' }}>
                  {edu.degreeType && edu.major ? `${edu.degreeType} of ${edu.major}` : edu.degreeType || edu.major}
                </div>
                {edu.university && (
                  <div style={{ fontSize: '10pt', color: 'rgba(255,255,255,0.85)' }}>{edu.university}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right Main ── */}
      <div style={{ flex: 1, padding: '0.6in 0.5in' }}>
        {/* Summary */}
        {data.professionalSummary && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <MainHeading title="Professional Summary" />
            <p style={{ fontSize: '11pt', lineHeight: 1.5, color: TEXT }}>{data.professionalSummary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div style={{ marginBottom: SECTION_SPACING }}>
            <MainHeading title="Experience" />
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < data.experience.length - 1 ? '10pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>{exp.role}</div>
                <div style={{ fontSize: '10.5pt', color: ACCENT, fontStyle: 'italic', marginTop: '1pt' }}>
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
            <MainHeading title="Projects" />
            {data.projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '6pt' : 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '11pt', color: TEXT }}>
                  {proj.name}
                  {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10pt', color: ACCENT }}> • {proj.link}</span>}
                </div>
                {proj.technologies && (
                  <div style={{ fontSize: '10.5pt', color: ACCENT, fontStyle: 'italic' }}>{proj.technologies}</div>
                )}
                {proj.description && (
                  <div style={{ fontSize: '11pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Additional */}
        {(data.certifications || data.extracurriculars) && (
          <div>
            {data.certifications && (
              <div style={{ marginBottom: data.extracurriculars ? '8pt' : 0 }}>
                <MainHeading title="Certifications" />
                <div style={{ fontSize: '11pt', color: TEXT }}>{data.certifications}</div>
              </div>
            )}
            {data.extracurriculars && (
              <>
                <MainHeading title="Extracurricular Activities" />
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
