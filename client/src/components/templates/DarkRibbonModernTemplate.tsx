// PDF-rendered: inline styles only
import React from 'react';
import { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const IconPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.79 19.79 0 0 1 .07 1.18 2 2 0 0 1 2.11 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconEmail = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconLocation = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const iconBadgeStyle: React.CSSProperties = {
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  backgroundColor: '#555555',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
};

const DarkRibbonModernTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const hasSkills = data.skills.technical.length > 0 &&
    data.skills.technical.some(c => c.category.trim() && c.items.length > 0);
  const hasLanguages = data.skills.languages.length > 0 &&
    data.skills.languages.some(l => l.language);
  const locationText = [data.city, data.country].filter(Boolean).join(', ');

  const ContactItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => {
    if (!text) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in', marginBottom: '12pt' }}>
        <div style={iconBadgeStyle}>{icon}</div>
        <span style={{ color: '#cccccc', fontSize: '10pt', lineHeight: '1.3', wordBreak: 'break-all' }}>{text}</span>
      </div>
    );
  };

  const SidebarRibbon = ({ title }: { title: string }) => (
    <div style={{
      marginBottom: '16pt',
      marginTop: '20pt',
      position: 'relative',
      width: '100%',
      zIndex: 20,
      filter: 'drop-shadow(4px 6px 6px rgba(0,0,0,0.4))',
    }}>
      <div style={{
        background: 'linear-gradient(to right, #2a2a2a, #383838)',
        padding: '0.12in 0.4in',
        position: 'relative',
        border: '1px solid #444444',
        borderLeft: 'none',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 15px) 50%, 100% 100%, 0 100%)',
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '13.5pt',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          margin: 0,
        }}>{title}</h2>
      </div>
    </div>
  );

  const MainRibbon = ({ title }: { title: string }) => (
    <div style={{
      marginBottom: '20pt',
      marginTop: '28pt',
      position: 'relative',
      zIndex: 0,
      width: 'max-content',
      minWidth: '65%',
      filter: 'drop-shadow(4px 6px 8px rgba(0,0,0,0.25))',
    }}>
      <div style={{
        background: 'linear-gradient(to right, #222222, #3a3a3a)',
        padding: '0.14in 1.2in 0.14in 0.6in',
        position: 'relative',
        border: '1px solid #555555',
        borderLeft: 'none',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)',
        clipPath: 'polygon(0 0, 100% 0, calc(100% - 20px) 50%, 100% 100%, 0 100%)',
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '16pt',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          margin: 0,
        }}>{title}</h2>
      </div>
    </div>
  );

  const timelineDotStyle: React.CSSProperties = {
    width: '0.08in',
    height: '0.08in',
    backgroundColor: '#8ba0c4',
    borderRadius: '50%',
    boxShadow: '0 0 0 4px white, 0 1px 2px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 3,
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100%',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'row',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <style>{`
        .drm-rich-content ul { list-style-type: disc; padding-left: 0.15in; margin: 4pt 0; }
        .drm-rich-content ol { list-style-type: decimal; padding-left: 0.15in; margin: 4pt 0; }
        .drm-rich-content li { margin-bottom: 2pt; color: #555555; }
        .drm-rich-content li::marker { color: #8ba0c4; }
        .drm-rich-content p { margin: 4pt 0; }
        .drm-skills-list ul { list-style-type: disc; padding-left: 0.12in; margin: 0; }
        .drm-skills-list li { color: #bbbbbb; font-size: 10pt; line-height: 1.6; padding-left: 4pt; }
        .drm-skills-list li::marker { color: #8ba0c4; }
      `}</style>

      {/* LEFT SIDEBAR (35%) */}
      <div style={{
        width: '35%',
        background: 'linear-gradient(to bottom, #2b2b2b, #222222)',
        paddingBottom: '0.4in',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        boxShadow: '4px 0 15px rgba(0,0,0,0.15)',
      }}>
        {/* Profile Photo */}
        <div style={{ marginBottom: '0.3in', marginTop: '0.4in', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            height: '2.2in',
            width: '2.2in',
            backgroundColor: '#3a3a3a',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #151515',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {data.profilePhoto ? (
              <img src={data.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.professionalSummary && (
          <div style={{ marginBottom: '24pt' }}>
            <SidebarRibbon title="Summary" />
            <div style={{ padding: '0 0.4in' }}>
              <p style={{ color: '#cccccc', fontSize: '10pt', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                {data.professionalSummary}
              </p>
            </div>
          </div>
        )}

        {/* Skills */}
        {(hasSkills || hasLanguages) && (
          <div style={{ marginBottom: '24pt' }}>
            <SidebarRibbon title="Skills" />
            <div style={{ padding: '0 0.4in' }}>
              {hasSkills && data.skills.technical.map((cat, i) => {
                if (!cat.category.trim() || cat.items.length === 0) return null;
                return (
                  <div key={i} style={{ marginBottom: '12pt' }}>
                    <h3 style={{ color: '#eeeeee', fontSize: '10.5pt', fontWeight: 'bold', margin: '0 0 4pt 0' }}>{cat.category}</h3>
                    <div className="drm-skills-list">
                      <ul style={{ margin: 0, paddingLeft: '0.12in', listStyleType: 'disc' }}>
                        {cat.items.map((item, j) => (
                          <li key={j} style={{ color: '#bbbbbb', fontSize: '10pt', lineHeight: '1.6', paddingLeft: '4pt' }}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}

              {hasLanguages && (
                <div style={{ marginTop: '20pt' }}>
                  <h3 style={{ color: '#eeeeee', fontSize: '10.5pt', fontWeight: 'bold', margin: '0 0 8pt 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Languages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4pt' }}>
                    {data.skills.languages.filter(l => l.language).map((l, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#cccccc', fontSize: '10pt' }}>
                        <span>{l.language}</span>
                        <span style={{ color: '#8ba0c4', fontSize: '9pt', fontWeight: '500' }}>{l.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ marginBottom: '24pt' }}>
          <SidebarRibbon title="Contact" />
          <div style={{ padding: '0 0.4in' }}>
            <ContactItem icon={<IconPhone />} text={data.phone || ''} />
            <ContactItem icon={<IconEmail />} text={data.email || ''} />
            {data.portfolioUrl && (
              <ContactItem icon={<IconLink />} text={data.portfolioUrl.replace(/^https?:\/\//, '')} />
            )}
            {data.linkedinUrl && (
              <ContactItem icon={<IconLink />} text={data.linkedinUrl.replace(/^https?:\/\//, '')} />
            )}
            {locationText && <ContactItem icon={<IconLocation />} text={locationText} />}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (65%) */}
      <div style={{
        width: '65%',
        backgroundColor: 'white',
        padding: '0.6in 0',
        position: 'relative',
        zIndex: 0,
      }}>
        {/* Background Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '2in',
          height: '2in',
          backgroundColor: '#f8f9fb',
          borderBottomLeftRadius: '50%',
          zIndex: -1,
          opacity: 0.6,
        }} />

        {/* Name Header */}
        <div style={{ padding: '0 0.6in', marginBottom: '0.5in' }}>
          <h1 style={{
            color: '#2b2b2b',
            fontSize: '48pt',
            fontWeight: '800',
            lineHeight: '0.95',
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            wordBreak: 'break-word',
          }}>
            {data.fullName ? (
              data.fullName.split(' ').map((word, i, arr) => (
                <React.Fragment key={i}>
                  {word}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            ) : 'YOUR NAME'}
          </h1>
          {data.targetRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12pt', marginTop: '16pt' }}>
              <div style={{ height: '2px', width: '0.4in', backgroundColor: '#8ba0c4', flexShrink: 0 }} />
              <h2 style={{ color: '#666666', fontSize: '16pt', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                {data.targetRole}
              </h2>
            </div>
          )}
        </div>

        {/* Education */}
        {data.education.length > 0 && data.education[0].university && (
          <div style={{ marginBottom: '0.4in' }}>
            <MainRibbon title="Education" />
            <div style={{ padding: '0 0.6in', paddingTop: '8pt' }}>
              {data.education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', marginBottom: '0.2in', position: 'relative' }}>
                  <div style={{ width: '0.25in', marginTop: '0.06in', flexShrink: 0 }}>
                    <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#8ba0c4', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '8pt' }}>
                    <div style={{ color: '#8ba0c4', fontSize: '10pt', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4pt', textTransform: 'uppercase' }}>
                      {edu.graduationDate}
                    </div>
                    <div style={{ color: '#2b2b2b', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '2pt' }}>
                      {edu.university || 'University'}
                    </div>
                    <div style={{ color: '#444444', fontSize: '10.5pt', fontWeight: '500', marginBottom: '6pt' }}>
                      {edu.degreeType || 'Degree'}{edu.major && ` in ${edu.major}`}
                    </div>
                    {!isEmptyRichText(edu.relevantCoursework) && (
                      <div
                        className="drm-rich-content"
                        style={{ fontSize: '10pt', color: '#666666', lineHeight: '1.6', marginTop: '4pt' }}
                        dangerouslySetInnerHTML={{ __html: edu.relevantCoursework! }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {data.experience.length > 0 && data.experience[0].company && (
          <div style={{ marginBottom: '0.4in' }}>
            <MainRibbon title="Experience" />
            <div style={{ padding: '0 0.6in', paddingTop: '8pt', position: 'relative' }}>
              {data.experience.length > 1 && (
                <div style={{ position: 'absolute', top: '0.1in', bottom: '0.2in', left: 'calc(0.6in + 0.04in)', borderLeft: '2px solid #e5e7eb', zIndex: 1 }} />
              )}
              {data.experience.map((exp, i) => (
                <div key={i} style={{ display: 'flex', marginBottom: '0.3in', position: 'relative', zIndex: 2 }}>
                  <div style={{ width: '0.25in', marginTop: '0.06in', flexShrink: 0, backgroundColor: 'white' }}>
                    <div style={timelineDotStyle} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '4pt' }}>
                    <div style={{ color: '#2b2b2b', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '2pt' }}>
                      {exp.role || 'Job Title'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8pt', marginBottom: '10pt' }}>
                      <span style={{ color: '#444444', fontSize: '10.5pt', fontWeight: '600' }}>{exp.company || 'Company'}</span>
                      <span style={{ color: '#cccccc' }}>|</span>
                      <span style={{ color: '#8ba0c4', fontSize: '9.5pt', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {exp.duration}
                      </span>
                    </div>
                    {!isEmptyRichText(exp.responsibilities) && (
                      <div
                        className="drm-rich-content"
                        style={{ fontSize: '10pt', color: '#555555', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && data.projects[0].name && (
          <div style={{ marginBottom: '0.4in' }}>
            <MainRibbon title="Projects" />
            <div style={{ padding: '0 0.6in', paddingTop: '8pt', position: 'relative' }}>
              {data.projects.length > 1 && (
                <div style={{ position: 'absolute', top: '0.1in', bottom: '0.2in', left: 'calc(0.6in + 0.04in)', borderLeft: '2px solid #e5e7eb', zIndex: 1 }} />
              )}
              {data.projects.map((proj, i) => (
                <div key={i} style={{ display: 'flex', marginBottom: '0.25in', position: 'relative', zIndex: 2 }}>
                  <div style={{ width: '0.25in', marginTop: '0.06in', flexShrink: 0, backgroundColor: 'white' }}>
                    <div style={timelineDotStyle} />
                  </div>
                  <div style={{ flex: 1, paddingBottom: '4pt' }}>
                    <div style={{ color: '#2b2b2b', fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: '1.2', marginBottom: '2pt' }}>
                      {proj.name || 'Project Name'}
                    </div>
                    <div style={{ color: '#8ba0c4', fontSize: '9.5pt', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '8pt' }}>
                      {proj.role && `${proj.role} | `}{proj.technologies}
                    </div>
                    {!isEmptyRichText(proj.description) && (
                      <div
                        className="drm-rich-content"
                        style={{ fontSize: '10pt', color: '#555555', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: proj.description }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DarkRibbonModernTemplate;
