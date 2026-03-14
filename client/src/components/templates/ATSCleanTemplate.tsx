import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const TEXT_DARK = '#000000';
const TEXT_MUTED = '#333333';

const styles = {
  page: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '11pt',
    color: TEXT_DARK,
    backgroundColor: '#ffffff',
    padding: '0.6in 0.8in',
    width: '100%',
    minHeight: '100%',
    boxSizing: 'border-box',
    lineHeight: '1.5',
  } as React.CSSProperties,

  name: {
    fontSize: '24pt',
    fontWeight: 700,
    color: TEXT_DARK,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 4pt 0',
  } as React.CSSProperties,

  contactLine: {
    fontSize: '10pt',
    color: TEXT_MUTED,
    margin: '0 0 16pt 0',
  } as React.CSSProperties,

  section: {
    marginBottom: '16pt',
  } as React.CSSProperties,

  sectionHeading: {
    fontSize: '13pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: TEXT_DARK,
    margin: '0 0 8pt 0',
    paddingBottom: '4pt',
    borderBottom: `1pt solid ${TEXT_DARK}`,
  } as React.CSSProperties,

  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2pt',
  } as React.CSSProperties,

  jobTitle: {
    fontSize: '11.5pt',
    fontWeight: 700,
    color: TEXT_DARK,
    margin: 0,
  } as React.CSSProperties,

  jobMeta: {
    fontSize: '11pt',
    fontWeight: 700,
    color: TEXT_MUTED,
    margin: '0 0 4pt 0',
  } as React.CSSProperties,

  bulletList: {
    margin: '4pt 0 12pt 0',
    paddingLeft: '18pt',
  } as React.CSSProperties,

  skillRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: '4pt',
    fontSize: '11pt',
  } as React.CSSProperties,

  skillCategory: {
    fontWeight: 700,
    color: TEXT_DARK,
    flexShrink: 0,
  } as React.CSSProperties,
};

const ATSCleanTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const contactParts = [
    data.email,
    data.phone,
    [data.city, data.country].filter(Boolean).join(', '),
    data.linkedinUrl,
    data.portfolioUrl,
  ].filter(Boolean).join(' | ');

  const skillGroups = [
    ...data.skills.categories.filter((c) => c.category.trim() && c.items.length > 0),
    ...(data.skills.languages.filter((l) => l.language).length > 0
      ? [{
          category: 'Languages',
          items: data.skills.languages.filter((l) => l.language).map(
            (l) => `${l.language}${l.proficiency ? ` (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})` : ''}`
          ),
        }]
      : []),
  ];

  return (
    <div style={styles.page}>
      <style>{`
        .rich-content ul { list-style-type: disc; padding-left: 18pt; margin: 4pt 0; }
        .rich-content ol { list-style-type: decimal; padding-left: 18pt; margin: 4pt 0; }
        .rich-content li { margin-bottom: 2pt; }
        .rich-content p { margin: 0; }
      `}</style>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '16pt' }}>
        <h1 style={styles.name}>{data.fullName || 'Your Name'}</h1>
        <p style={styles.contactLine}>{contactParts || 'email@example.com | phone | location'}</p>
      </header>

      {/* Professional Summary */}
      {data.professionalSummary && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Professional Summary</h2>
          <div style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: data.professionalSummary }} />
        </section>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Work Experience</h2>
          {data.experience.map((job, i) => (
            <div key={i} style={{ marginBottom: '12pt' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{job.role}</h3>
                <span style={{ fontSize: '10.5pt', fontWeight: 700, color: TEXT_MUTED }}>{job.duration}</span>
              </div>
              <p style={styles.jobMeta}>{job.company}</p>
              {!isEmptyRichText(job.responsibilities) && (
                <div className="rich-content" style={styles.bulletList} dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '10pt' }}>
              <div style={styles.jobHeader}>
                <h3 style={styles.jobTitle}>{proj.name}</h3>
                {proj.role && (
                  <span style={{ fontSize: '10.5pt', fontWeight: 700, color: TEXT_MUTED }}>{proj.role}</span>
                )}
              </div>
              {proj.technologies && (
                <p style={styles.jobMeta}>Technologies: {proj.technologies}</p>
              )}
              {!isEmptyRichText(proj.description) && (
                <div className="rich-content" style={{ margin: '4pt 0 0 0', fontSize: '10.5pt' }} dangerouslySetInnerHTML={{ __html: proj.description }} />
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Education</h2>
          {data.education.map((edu, i) => {
            const degree = [edu.degreeType, edu.major].filter(Boolean).join(' in ');
            return (
              <div key={i} style={{ marginBottom: '10pt' }}>
                <div style={styles.jobHeader}>
                  <h3 style={styles.jobTitle}>{degree || edu.university}</h3>
                  <span style={{ fontSize: '10.5pt', fontWeight: 700, color: TEXT_MUTED }}>{edu.graduationDate}</span>
                </div>
                <p style={styles.jobMeta}>
                  {edu.university}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  {edu.honors ? ` | ${edu.honors}` : ''}
                </p>
                {!isEmptyRichText(edu.relevantCoursework) && (
                  <div style={{ margin: '2pt 0 0 0', fontSize: '10.5pt', color: TEXT_MUTED }}>
                    <span>Relevant Coursework: </span>
                    <div className="rich-content" dangerouslySetInnerHTML={{ __html: edu.relevantCoursework! }} />
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Skills */}
      {skillGroups.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Skills</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4pt' }}>
            {skillGroups.map((group, i) =>
              group.items.length > 0 && (
                <div key={i} style={styles.skillRow}>
                  <span style={styles.skillCategory}>{group.category}:&nbsp;</span>
                  <span style={{ color: TEXT_MUTED }}>{group.items.join(', ')}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Certifications */}
      {!isEmptyRichText(data.certifications) && (
        <section style={styles.section}>
          <h2 style={styles.sectionHeading}>Certifications</h2>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: data.certifications! }} />
        </section>
      )}

    </div>
  );
};

export default ATSCleanTemplate;
