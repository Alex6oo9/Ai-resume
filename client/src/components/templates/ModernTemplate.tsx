import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const FONT_HEADING = "'Outfit', 'Helvetica Neue', Arial, sans-serif";
const FONT_BODY    = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const COLOR_INK    = '#1a1a1a';
const COLOR_MUTED  = '#555555';
const COLOR_FAINT  = '#888888';
const COLOR_RULE   = '#d4d4d4';
const COLOR_ACCENT = '#2b2b2b';

const sectionHeading: React.CSSProperties = {
  fontFamily: FONT_HEADING,
  fontSize: '8.5pt',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.8px',
  color: COLOR_ACCENT,
  borderBottom: `1.5px solid ${COLOR_RULE}`,
  paddingBottom: '4pt',
  marginBottom: '10pt',
  marginTop: '0',
};

const ModernTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const contactParts: string[] = [];
  if (data.email)   contactParts.push(data.email);
  if (data.phone)   contactParts.push(data.phone);
  const loc = [data.city, data.country].filter(Boolean).join(', ');
  if (loc) contactParts.push(loc);

  const linkParts: string[] = [];
  if (data.linkedinUrl)  linkParts.push(data.linkedinUrl.replace(/^https?:\/\//, ''));
  if (data.portfolioUrl) linkParts.push(data.portfolioUrl.replace(/^https?:\/\//, ''));

  const allContact = [...contactParts, ...linkParts];

  const hasExperience = data.experience?.length > 0 && !!data.experience[0].company;
  const hasEducation  = data.education?.length  > 0 && !!data.education[0].university;
  const hasSkills     = data.skills?.categories?.some(c => c.items?.length > 0);
  const hasLanguages  = data.skills?.languages?.length > 0;
  const hasProjects   = data.projects?.length > 0 && !!data.projects[0].name;

  const dot = (
    <span style={{ color: COLOR_RULE, margin: '0 6pt', fontWeight: 400 }}>·</span>
  );

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#ffffff',
        color: COLOR_INK,
        fontFamily: FONT_BODY,
        padding: '44pt 52pt',
        boxSizing: 'border-box',
        fontSize: '10pt',
        lineHeight: '1.55',
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderBottom: `2px solid ${COLOR_RULE}`,
          paddingBottom: '20pt',
          marginBottom: '20pt',
        }}
      >
        {data.profilePhoto && (
          <div
            style={{
              width: '84pt',
              height: '84pt',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2pt solid ${COLOR_RULE}`,
              marginBottom: '12pt',
              flexShrink: 0,
            }}
          >
            <img
              src={data.profilePhoto}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <h1
          style={{
            fontFamily: FONT_HEADING,
            fontSize: '22pt',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: COLOR_INK,
            margin: '0 0 5pt 0',
            lineHeight: '1.1',
          }}
        >
          {data.fullName || 'Your Name'}
        </h1>

        {data.targetRole && (
          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize: '11pt',
              fontWeight: 400,
              color: COLOR_MUTED,
              margin: '0 0 10pt 0',
              letterSpacing: '0.3px',
            }}
          >
            {data.targetRole}
          </p>
        )}

        {allContact.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '8.5pt',
              color: COLOR_MUTED,
              lineHeight: '1.6',
            }}
          >
            {allContact.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && dot}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      {/* ── Summary ── */}
      {data.professionalSummary && !isEmptyRichText(data.professionalSummary) && (
        <section style={{ marginBottom: '18pt' }}>
          <div
            style={{
              fontSize: '10pt',
              color: COLOR_MUTED,
              lineHeight: '1.65',
            }}
            dangerouslySetInnerHTML={{ __html: data.professionalSummary }}
          />
        </section>
      )}

      {/* ── Experience ── */}
      {hasExperience && (
        <section style={{ marginBottom: '18pt' }}>
          <h3 style={sectionHeading}>Experience</h3>
          <div>
            {data.experience.map((exp, i) => (
              <div
                key={i}
                style={{ marginBottom: i < data.experience.length - 1 ? '13pt' : '0' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2pt',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 600,
                      fontSize: '10.5pt',
                      color: COLOR_INK,
                    }}
                  >
                    {exp.role || 'Role'}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '8.5pt',
                      color: COLOR_FAINT,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      marginLeft: '8pt',
                    }}
                  >
                    {exp.duration || ''}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '9.5pt',
                    color: COLOR_MUTED,
                    fontWeight: 500,
                    marginBottom: '5pt',
                  }}
                >
                  {exp.company || 'Company'}
                  {exp.type && (
                    <span
                      style={{
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: COLOR_FAINT,
                      }}
                    >
                      {' '}— {exp.type}
                    </span>
                  )}
                </div>
                {exp.responsibilities && !isEmptyRichText(exp.responsibilities) && (
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '9.5pt',
                      color: COLOR_MUTED,
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ── */}
      {hasEducation && (
        <section style={{ marginBottom: '18pt' }}>
          <h3 style={sectionHeading}>Education</h3>
          <div>
            {data.education.map((edu, i) => (
              <div
                key={i}
                style={{ marginBottom: i < data.education.length - 1 ? '11pt' : '0' }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2pt',
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 600,
                      fontSize: '10.5pt',
                      color: COLOR_INK,
                    }}
                  >
                    {edu.university || 'University'}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '8.5pt',
                      color: COLOR_FAINT,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      marginLeft: '8pt',
                    }}
                  >
                    {edu.graduationDate || ''}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: FONT_BODY,
                    fontSize: '9.5pt',
                    color: COLOR_MUTED,
                    marginBottom: '3pt',
                  }}
                >
                  {edu.degreeType || 'Degree'}
                  {edu.major && ` in ${edu.major}`}
                </div>
                {edu.relevantCoursework && !isEmptyRichText(edu.relevantCoursework) && (
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '9pt',
                      color: COLOR_FAINT,
                      lineHeight: '1.5',
                    }}
                    dangerouslySetInnerHTML={{ __html: edu.relevantCoursework }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Skills ── */}
      {hasSkills && (
        <section style={{ marginBottom: '18pt' }}>
          <h3 style={sectionHeading}>Skills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5pt' }}>
            {data.skills.categories.map((cat, i) => {
              if (!cat.items || cat.items.length === 0) return null;
              return (
                <div key={i} style={{ display: 'flex', fontSize: '9.5pt' }}>
                  <span
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 600,
                      color: COLOR_INK,
                      width: '110pt',
                      flexShrink: 0,
                    }}
                  >
                    {cat.category}
                  </span>
                  <span style={{ fontFamily: FONT_BODY, color: COLOR_MUTED }}>
                    {cat.items.join(', ')}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Languages ── */}
      {hasLanguages && (
        <section style={{ marginBottom: '18pt' }}>
          <h3 style={sectionHeading}>Languages</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4pt 24pt' }}>
            {data.skills.languages.map((lang, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5pt',
                  fontSize: '9.5pt',
                }}
              >
                <span
                  style={{ fontFamily: FONT_HEADING, fontWeight: 600, color: COLOR_INK }}
                >
                  {lang.language}
                </span>
                {lang.proficiency && (
                  <>
                    <span style={{ color: COLOR_RULE }}>—</span>
                    <span style={{ fontFamily: FONT_BODY, color: COLOR_MUTED }}>
                      {lang.proficiency}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Projects ── */}
      {hasProjects && (
        <section style={{ marginBottom: '18pt' }}>
          <h3 style={sectionHeading}>Projects</h3>
          <div>
            {data.projects.map((proj, i) => (
              <div
                key={i}
                style={{ marginBottom: i < data.projects.length - 1 ? '11pt' : '0' }}
              >
                <div style={{ marginBottom: '2pt' }}>
                  <span
                    style={{
                      fontFamily: FONT_HEADING,
                      fontWeight: 600,
                      fontSize: '10.5pt',
                      color: COLOR_INK,
                    }}
                  >
                    {proj.name || 'Project'}
                  </span>
                  {proj.link && (
                    <span
                      style={{
                        fontFamily: FONT_BODY,
                        fontWeight: 400,
                        fontSize: '8.5pt',
                        color: '#3b6fc4',
                        marginLeft: '7pt',
                      }}
                    >
                      {proj.link.replace(/^https?:\/\//, '')}
                    </span>
                  )}
                </div>
                {(proj.role || proj.technologies) && (
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '8.5pt',
                      color: COLOR_FAINT,
                      fontWeight: 500,
                      marginBottom: '4pt',
                    }}
                  >
                    {proj.role}
                    {proj.role && proj.technologies && ' · '}
                    {proj.technologies}
                  </div>
                )}
                {proj.description && !isEmptyRichText(proj.description) && (
                  <div
                    style={{
                      fontFamily: FONT_BODY,
                      fontSize: '9.5pt',
                      color: COLOR_MUTED,
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: proj.description }}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ModernTemplate;
