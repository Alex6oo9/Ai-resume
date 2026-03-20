import React from 'react';
import type { ResumeTemplateProps } from './types';
import { isEmptyRichText } from '../../utils/richText';

const ACCENT = '#1a3557';

const styles = {
  page: {
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '11pt',
    color: '#222222',
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
    color: ACCENT,
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 4pt 0',
  } as React.CSSProperties,

  contactLine: {
    fontSize: '10pt',
    color: '#444444',
    margin: '0 0 16pt 0',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  section: {
    marginBottom: '16pt',
  } as React.CSSProperties,

  sectionHeading: {
    fontSize: '13pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    color: ACCENT,
    margin: '0 0 8pt 0',
    paddingBottom: '4pt',
    borderBottom: `1.5pt solid ${ACCENT}`,
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
    color: '#222222',
    margin: 0,
  } as React.CSSProperties,

  jobMeta: {
    fontSize: '11pt',
    fontStyle: 'italic' as const,
    color: '#444444',
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
    color: '#111111',
    flexShrink: 0,
  } as React.CSSProperties,
};

const ATSLinedTemplate: React.FC<ResumeTemplateProps> = ({ data }) => {
  const contactParts = [
    data.email,
    data.phone,
    [data.city, data.country].filter(Boolean).join(', '),
    data.linkedinUrl,
    data.portfolioUrl,
  ].filter(Boolean).join(' | ');

  const skillGroups = [
    ...data.skills.technical.filter((c) => c.category.trim() && c.items.length > 0),
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
        .rich-content li { margin-bottom: 3pt; padding-left: 2pt; }
        .rich-content p { margin: 4pt 0; }
      `}</style>

      {/* Contact Block */}
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
                  <span style={{ fontSize: '10.5pt', fontWeight: 700, color: '#555555' }}>{job.duration}</span>
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
                  <span style={{ fontSize: '10.5pt', fontWeight: 700, color: '#555555' }}>{proj.role}</span>
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
                  <span style={{ fontSize: '10.5pt', fontWeight: 700, color: '#555555' }}>{edu.graduationDate}</span>
                </div>
                <p style={styles.jobMeta}>
                  {edu.university}
                  {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                  {edu.honors ? ` | ${edu.honors}` : ''}
                </p>
                {!isEmptyRichText(edu.relevantCoursework) && (
                  <div style={{ margin: '2pt 0 0 0', fontSize: '10.5pt', color: '#444444' }}>
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
          {skillGroups.map((group, i) => (
            group.items.length > 0 && (
              <div key={i} style={styles.skillRow}>
                <span style={styles.skillCategory}>{group.category}:&nbsp;</span>
                <span>{group.items.join(', ')}</span>
              </div>
            )
          ))}
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

export default ATSLinedTemplate;
