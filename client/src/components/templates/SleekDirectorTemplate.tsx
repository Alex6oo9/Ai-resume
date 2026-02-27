import type { ResumeTemplateProps } from './types';
import { formatHeading, parseResponsibilities } from './helpers/renderingHelpers';

const HEADER_BG = '#726f6a';
const SIDEBAR_BG = '#e3e3e3';
const SIDEBAR_FG = '#1a1a1a';
const DIVIDER_COLOR = '#9ca3af';
const TEXT = '#555555';
const HEADING_COLOR = '#1a1a1a';
const FONT_BODY = 'Inter, system-ui, sans-serif';
const FONT_HEADING = 'Montserrat, Inter, system-ui, sans-serif';

function CylinderHeading({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8pt' }}>
      <h2 style={{ fontSize: '11.5pt', fontWeight: 'bold', color: SIDEBAR_FG, fontFamily: FONT_HEADING, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {formatHeading(title, 'uppercase')}
      </h2>
      <div style={{ flex: 1, height: '1px', backgroundColor: DIVIDER_COLOR }} />
    </div>
  );
}

function MainHeading({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10pt' }}>
      <h2 style={{ fontSize: '11.5pt', fontWeight: 'bold', color: HEADING_COLOR, fontFamily: FONT_HEADING, textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {formatHeading(title, 'uppercase')}
      </h2>
      <div style={{ flex: 1, height: '1.5px', backgroundColor: DIVIDER_COLOR }} />
    </div>
  );
}

export default function SleekDirectorTemplate({ data }: ResumeTemplateProps) {
  const location = [data.city, data.country].filter(Boolean).join(', ');
  const contactItems = [
    data.phone && { label: '☎', value: data.phone },
    data.email && { label: '✉', value: data.email },
    location && { label: '⌖', value: location },
    data.portfolioUrl && { label: '⊕', value: data.portfolioUrl },
    data.linkedinUrl && { label: '⊕', value: data.linkedinUrl },
    ...(data.additionalLinks || []).filter((l) => l.url).map((l) => ({ label: '⊕', value: l.url })),
  ].filter(Boolean) as { label: string; value: string }[];

  // Split name: first name(s) italic, last name bold
  const nameParts = (data.fullName || '').trim().split(' ');
  const lastName = nameParts.pop() || '';
  const firstName = nameParts.join(' ');

  const skillItems: string[] = [];
  data.skills.technical.forEach((cat) => (cat.items || []).forEach((item) => item.trim() && skillItems.push(item.trim())));
  data.skills.soft.forEach((s) => s.trim() && skillItems.push(s.trim()));

  return (
    <div style={{ fontFamily: FONT_BODY, fontSize: '10.5pt', lineHeight: 1.7, color: TEXT, position: 'relative', minHeight: '100%', overflow: 'hidden', background: '#ffffff' }}>
      {/* ── Dark header band behind cylinder ── */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', backgroundColor: HEADER_BG, zIndex: 0 }} />

      {/* ── Two-column body ── */}
      <div style={{ display: 'flex', position: 'relative', minHeight: '100%' }}>
        {/* ── Cylinder Sidebar ── */}
        <div style={{ width: '38%', flexShrink: 0, marginLeft: '4%', backgroundColor: SIDEBAR_BG, borderRadius: '500px 500px 0 0', padding: '0 20px 32px', position: 'relative', zIndex: 2, alignSelf: 'flex-start' }}>
          {/* Photo at top of cylinder */}
          <div style={{ paddingTop: '52px', paddingBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            {data.profilePhoto ? (
              <img
                src={data.profilePhoto}
                alt={data.fullName || 'Profile'}
                style={{ width: '200px', height: '200px', borderRadius: '50%', objectFit: 'cover', border: `12px solid ${SIDEBAR_BG}`, display: 'block' }}
              />
            ) : (
              <div style={{ width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.05)', border: `12px solid ${SIDEBAR_BG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', color: 'rgba(0,0,0,0.2)' }}>
                &#128100;
              </div>
            )}
          </div>

          {/* Sidebar content */}
          <div style={{ padding: '0 6px' }}>
            {/* Education */}
            {data.education.length > 0 && (
              <div style={{ marginBottom: '18pt' }}>
                <CylinderHeading title="Education" />
                {data.education.map((edu, i) => (
                  <div key={i} style={{ marginBottom: i < data.education.length - 1 ? '10pt' : 0 }}>
                    {edu.graduationDate && (
                      <div style={{ fontSize: '10pt', color: SIDEBAR_FG, opacity: 0.85, marginBottom: '2pt' }}>{edu.graduationDate}</div>
                    )}
                    <div style={{ fontSize: '10pt', fontWeight: 'bold', color: SIDEBAR_FG, textTransform: 'uppercase' }}>
                      {edu.degreeType && edu.major ? `${edu.degreeType} of ${edu.major}` : edu.degreeType || edu.major}
                    </div>
                    {edu.university && (
                      <div style={{ fontSize: '10pt', fontWeight: 'bold', color: SIDEBAR_FG, textTransform: 'uppercase' }}>{edu.university}</div>
                    )}
                    {edu.relevantCoursework && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4pt', marginTop: '3pt', fontSize: '10pt', color: SIDEBAR_FG }}>
                        <span style={{ flexShrink: 0 }}>•</span>
                        <span>{edu.relevantCoursework}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {(skillItems.length > 0 || data.skills.languages.some((l) => l.language)) && (
              <div style={{ marginBottom: '18pt' }}>
                <CylinderHeading title="Skills" />
                {skillItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '4pt', fontSize: '10pt', color: SIDEBAR_FG }}>
                    <span style={{ flexShrink: 0 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
                {data.skills.languages.some((l) => l.language) && (
                  <div style={{ marginTop: '10pt' }}>
                    <CylinderHeading title="Languages" />
                    {data.skills.languages.filter((l) => l.language).map((l, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6pt', marginBottom: '4pt', fontSize: '10pt', color: SIDEBAR_FG }}>
                        <span style={{ flexShrink: 0 }}>•</span>
                        <span>{l.language}{l.proficiency && l.proficiency !== 'native' ? ` (${l.proficiency})` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Contact in sidebar */}
            {contactItems.length > 0 && (
              <div>
                <CylinderHeading title="Contact" />
                {contactItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '7pt', marginBottom: '5pt', fontSize: '10pt', color: SIDEBAR_FG, wordBreak: 'break-all' }}>
                    <span style={{ flexShrink: 0, opacity: 0.75, fontSize: '9pt', marginTop: '1pt' }}>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: name header + main content ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          {/* Name in dark header zone */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', padding: '32px 16px 24px 8px', minHeight: '220px', overflow: 'hidden' }}>
            <div style={{ textAlign: 'right', maxWidth: '100%' }}>
              {firstName && (
                <div style={{ fontFamily: FONT_HEADING, fontSize: '22pt', fontWeight: '400', fontStyle: 'italic', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1.15 }}>
                  {firstName}
                </div>
              )}
              <div style={{ fontFamily: FONT_HEADING, fontSize: '26pt', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1.05 }}>
                {lastName || data.fullName}
              </div>
              {data.targetRole && (
                <div style={{ fontFamily: FONT_HEADING, fontSize: '10pt', fontStyle: 'italic', color: '#ffffff', textTransform: 'capitalize', letterSpacing: '0.12em', marginTop: '6pt', opacity: 0.9 }}>
                  {data.targetRole}
                </div>
              )}
            </div>
          </div>

          {/* Main body */}
          <div style={{ padding: '16px 24px 32px 20px' }}>
            {/* Summary */}
            {data.professionalSummary && (
              <div style={{ marginBottom: '18pt' }}>
                <MainHeading title="Profile Info" />
                <p style={{ fontSize: '10.5pt', lineHeight: 1.7, color: TEXT }}>{data.professionalSummary}</p>
              </div>
            )}

            {/* Experience (timeline) */}
            {data.experience.length > 0 && (
              <div style={{ marginBottom: '18pt' }}>
                <MainHeading title="Experience" />
                <div style={{ position: 'relative', paddingLeft: '28pt' }}>
                  {data.experience.length > 1 && (
                    <div style={{ position: 'absolute', left: '8pt', top: '14pt', bottom: '14pt', width: '1.5px', backgroundColor: DIVIDER_COLOR }} />
                  )}
                  {data.experience.map((exp, i) => (
                    <div key={i} style={{ position: 'relative', marginBottom: i < data.experience.length - 1 ? '10pt' : 0 }}>
                      {/* Circle marker */}
                      <div style={{ position: 'absolute', left: '-28pt', top: '1pt', width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${DIVIDER_COLOR}`, backgroundColor: 'white', boxSizing: 'border-box' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8pt' }}>
                        <div>
                          <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: HEADING_COLOR, textTransform: 'uppercase' }}>{exp.role}</div>
                          <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: TEXT, marginTop: '1pt' }}>{exp.company}</div>
                        </div>
                        {exp.duration && (
                          <div style={{ fontSize: '10pt', color: TEXT, flexShrink: 0, opacity: 0.75 }}>{exp.duration}</div>
                        )}
                      </div>
                      {exp.responsibilities && (
                        <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '4pt', lineHeight: 1.7 }}>
                          {parseResponsibilities(exp.responsibilities).join(' ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <div style={{ marginBottom: '18pt' }}>
                <MainHeading title="Projects" />
                {data.projects.map((proj, i) => (
                  <div key={i} style={{ marginBottom: i < data.projects.length - 1 ? '8pt' : 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '10.5pt', color: HEADING_COLOR }}>
                      {proj.name}
                      {proj.link && <span style={{ fontWeight: 'normal', fontSize: '10pt', color: TEXT }}> • {proj.link}</span>}
                    </div>
                    {proj.technologies && <div style={{ fontSize: '10pt', color: TEXT, fontStyle: 'italic' }}>{proj.technologies}</div>}
                    {proj.description && <div style={{ fontSize: '10.5pt', color: TEXT, marginTop: '2pt' }}>{proj.description}</div>}
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
                    <div style={{ fontSize: '10.5pt', color: TEXT }}>{data.certifications}</div>
                  </div>
                )}
                {data.extracurriculars && (
                  <>
                    <MainHeading title="Activities" />
                    <div style={{ fontSize: '10.5pt', color: TEXT }}>{data.extracurriculars}</div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!data.fullName && (
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', color: '#9ca3af', padding: '32pt' }}>
          <p>Start filling in your information</p>
        </div>
      )}
    </div>
  );
}
