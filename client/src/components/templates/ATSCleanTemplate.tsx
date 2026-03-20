import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const TEXT_DARK = '#000000';
const TEXT_MUTED = '#333333';

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '13pt',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  margin: '0 0 8pt 0',
  paddingBottom: '4pt',
  color: TEXT_DARK,
  borderBottom: `1pt solid ${TEXT_DARK}`,
};

const ATSCleanTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const contactParts = [
    data.email,
    data.phone,
    [data.city, data.country].filter(Boolean).join(', '),
    data.linkedinUrl ? data.linkedinUrl.replace(/^https?:\/\//, '') : '',
    data.portfolioUrl ? data.portfolioUrl.replace(/^https?:\/\//, '') : '',
  ].filter(Boolean);

  const hasSkills = data.skills.technical.length > 0 &&
    data.skills.technical.some(c => c.category.trim() && c.items.length > 0);
  const hasLanguages = data.skills.languages.length > 0 &&
    data.skills.languages.some(l => l.language);

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: TEXT_DARK,
        fontSize: '11pt',
        lineHeight: '1.5',
        padding: '0.6in 0.8in',
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      <style>{`
        .ats-clean-rich-content ul { list-style-type: disc; padding-left: 18pt; margin: 4pt 0; }
        .ats-clean-rich-content ol { list-style-type: decimal; padding-left: 18pt; margin: 4pt 0; }
        .ats-clean-rich-content li { margin-bottom: 2pt; padding-left: 2pt; }
        .ats-clean-rich-content p { margin: 4pt 0; }
      `}</style>

      {/* Header */}
      <header style={{ marginBottom: '16pt', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '24pt',
          fontWeight: 'bold',
          margin: '0 0 4pt 0',
          color: TEXT_DARK,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}>
          {data.fullName || 'YOUR NAME'}
        </h1>
        {contactParts.length > 0 && (
          <div style={{ fontSize: '10pt', color: TEXT_MUTED }}>
            {contactParts.join('  |  ')}
          </div>
        )}
      </header>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={{ ...sectionHeadingStyle, margin: '0 0 6pt 0' }}>Professional Summary</h2>
          <p style={{ margin: 0, textAlign: 'justify', color: TEXT_MUTED }}>{data.professionalSummary}</p>
        </section>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && data.experience[0].company && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={sectionHeadingStyle}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '12pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                <h3 style={{ fontSize: '11.5pt', fontWeight: 'bold', margin: 0, color: TEXT_DARK }}>
                  {exp.role || 'Job Title'}
                </h3>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: TEXT_MUTED }}>
                  {exp.duration}
                </span>
              </div>
              <div style={{ fontSize: '11pt', fontWeight: 'bold', color: TEXT_MUTED, marginBottom: '4pt' }}>
                {exp.company || 'Company Name'}
              </div>
              {!isEmptyRichText(exp.responsibilities) && (
                <div
                  className="ats-clean-rich-content"
                  style={{ fontSize: '10.5pt', color: TEXT_MUTED }}
                  dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && data.projects[0].name && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={sectionHeadingStyle}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                <h3 style={{ fontSize: '11.5pt', fontWeight: 'bold', margin: 0, color: TEXT_DARK }}>
                  {proj.name || 'Project Name'}
                </h3>
              </div>
              {proj.role && (
                <div style={{ fontSize: '10.5pt', fontStyle: 'italic', color: TEXT_MUTED, marginBottom: '2pt' }}>
                  {proj.role}{proj.technologies && ` | ${proj.technologies}`}
                </div>
              )}
              {!isEmptyRichText(proj.description) && (
                <div
                  className="ats-clean-rich-content"
                  style={{ fontSize: '10.5pt', color: TEXT_MUTED, marginTop: '4pt' }}
                  dangerouslySetInnerHTML={{ __html: proj.description }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && data.education[0].university && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={sectionHeadingStyle}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                <h3 style={{ fontSize: '11.5pt', fontWeight: 'bold', margin: 0, color: TEXT_DARK }}>
                  {edu.university || 'University Name'}
                </h3>
                <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: TEXT_MUTED }}>
                  {edu.graduationDate}
                </span>
              </div>
              <div style={{ fontSize: '11pt', color: TEXT_MUTED, marginBottom: '4pt' }}>
                <span style={{ fontWeight: 'bold' }}>{edu.degreeType || 'Degree'}</span>
                {edu.major && ` in ${edu.major}`}
              </div>
              {!isEmptyRichText(edu.relevantCoursework) && (
                <div
                  className="ats-clean-rich-content"
                  style={{ fontSize: '10.5pt', color: TEXT_MUTED }}
                  dangerouslySetInnerHTML={{ __html: edu.relevantCoursework! }}
                />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills & Languages */}
      {(hasSkills || hasLanguages) && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={sectionHeadingStyle}>Skills & Expertise</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4pt' }}>
            {hasSkills && data.skills.technical.map((cat, i) => {
              if (!cat.category.trim() || cat.items.length === 0) return null;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 'bold', width: '120pt', flexShrink: 0, color: TEXT_DARK }}>{cat.category}:</span>
                  <span style={{ flex: 1, color: TEXT_MUTED }}>{cat.items.join(', ')}</span>
                </div>
              );
            })}
            {hasLanguages && (
              <div style={{ display: 'flex', alignItems: 'baseline', marginTop: hasSkills ? '4pt' : '0' }}>
                <span style={{ fontWeight: 'bold', width: '120pt', flexShrink: 0, color: TEXT_DARK }}>Languages:</span>
                <span style={{ flex: 1, color: TEXT_MUTED }}>
                  {data.skills.languages
                    .filter(l => l.language)
                    .map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`)
                    .join(', ')}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Certifications */}
      {!isEmptyRichText(data.certifications) && (
        <section style={{ marginBottom: '16pt' }}>
          <h2 style={sectionHeadingStyle}>Certifications</h2>
          <div className="ats-clean-rich-content" dangerouslySetInnerHTML={{ __html: data.certifications! }} />
        </section>
      )}
    </div>
  );
};

export default ATSCleanTemplate;
