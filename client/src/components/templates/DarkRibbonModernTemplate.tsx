// PDF-rendered: inline styles only
import React from 'react';
import { ResumeTemplateProps } from './types';

const IconPhone = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
);

const IconEmail = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const IconWeb = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
);

const IconLocation = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const DarkRibbonModernTemplate: React.FC<ResumeTemplateProps> = ({ data, isPreview }) => {
    return (
        <div style={{
            width: '100%',
            minHeight: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'row',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            boxSizing: 'border-box',
            boxShadow: isPreview ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
            overflow: 'hidden'
        }}>
            {/* Left Column */}
            <div style={{
                width: '35%',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                paddingBottom: '0.4in',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Profile Photo */}
                {data.profilePhoto && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#666666',
                            borderTopLeftRadius: '1.5in',
                            borderTopRightRadius: '1.5in',
                            padding: '0.1in 0.1in 0',
                            height: '2.5in',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            overflow: 'hidden'
                        }}>
                            <img src={data.profilePhoto} alt={data.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: '1.4in', borderTopRightRadius: '1.4in' }} />
                        </div>
                    </div>
                )}

                {/* Summary */}
                {data.professionalSummary && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.4in',
                            fontSize: '14pt',
                            fontWeight: 'bold',
                            width: 'calc(100% + 0.3in)',
                            boxSizing: 'border-box',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            Summary
                        </div>
                        <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.5, color: '#cccccc' }}>
                            {data.professionalSummary}
                        </div>
                    </div>
                )}

                {/* Skills */}
                {data.skills?.technical?.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.4in',
                            fontSize: '14pt',
                            fontWeight: 'bold',
                            width: 'calc(100% + 0.3in)',
                            boxSizing: 'border-box',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            Skills
                        </div>
                        <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.5, color: '#cccccc' }}>
                            <ul style={{ margin: 0, paddingLeft: '0.15in' }}>
                                {data.skills.technical.map((skill, idx) => (
                                    <li key={idx} style={{ marginBottom: '0.05in' }}>
                                        {skill.category}: {skill.items.join(', ')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Contact */}
                <div style={{ marginBottom: '0.3in' }}>
                    <div style={{
                        backgroundColor: '#151515',
                        color: '#ffffff',
                        padding: '0.1in 0.4in',
                        fontSize: '14pt',
                        fontWeight: 'bold',
                        width: 'calc(100% + 0.3in)',
                        boxSizing: 'border-box',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        Contact
                    </div>
                    <div style={{ padding: '0.15in 0.4in 0', fontSize: '10pt', lineHeight: 1.6, color: '#cccccc', display: 'flex', flexDirection: 'column', gap: '0.1in' }}>
                        {data.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconPhone />
                                </div>
                                <span>{data.phone}</span>
                            </div>
                        )}
                        {data.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconEmail />
                                </div>
                                <span>{data.email}</span>
                            </div>
                        )}
                        {data.portfolioUrl && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconWeb />
                                </div>
                                <span>{data.portfolioUrl}</span>
                            </div>
                        )}
                        {(data.city || data.country) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.1in' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#555555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconLocation />
                                </div>
                                <span>{[data.city, data.country].filter(Boolean).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div style={{
                width: '65%',
                padding: '0.5in 0',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box'
            }}>
                {/* Header Name & Role */}
                <div style={{ padding: '0 0.5in', marginBottom: '0.4in' }}>
                    <h1 style={{ margin: '0 0 0.05in 0', fontSize: '46pt', color: '#4a4e59', lineHeight: 1.0, fontWeight: '800' }}>
                        {data.fullName?.split(' ').map((name, i, arr) => (
                            <React.Fragment key={i}>
                                {name}
                                {i < arr.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h1>
                    <h2 style={{ margin: 0, fontSize: '16pt', color: '#888888', fontWeight: 'normal', fontStyle: 'italic' }}>
                        {data.targetRole}
                    </h2>
                </div>

                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Education
                        </div>
                        <div style={{ padding: '0 0.5in' }}>
                            {data.education.map((edu, idx) => (
                                <div key={idx} style={{ display: 'flex', marginBottom: '0.15in' }}>
                                    <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                        <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.02in' }}>
                                            {edu.graduationDate}
                                        </div>
                                        <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold' }}>
                                            {edu.university}
                                        </div>
                                        <div style={{ fontSize: '10pt', color: '#555555' }}>
                                            {edu.degreeType} {edu.major ? `in ${edu.major}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Work Experience */}
                {data.experience && data.experience.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Work Experience
                        </div>
                        <div style={{ padding: '0 0.5in', position: 'relative' }}>
                            {data.experience.length > 1 && (
                                <div style={{ position: 'absolute', top: '0.08in', bottom: '0.2in', left: '0.54in', borderLeft: '1px solid #cccccc', zIndex: 1 }}></div>
                            )}
                            {data.experience.map((exp, idx) => {
                                const responsibilities = exp.responsibilities ? exp.responsibilities.split('\n').filter(Boolean) : [];
                                return (
                                    <div key={idx} style={{ display: 'flex', marginBottom: '0.2in', position: 'relative', zIndex: 2 }}>
                                        <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                            <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold', marginBottom: '0.02in' }}>
                                                {exp.role}
                                            </div>
                                            <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.05in' }}>
                                                {exp.company} | {exp.duration}
                                            </div>
                                            {responsibilities.length > 0 && (
                                                <ul style={{ margin: 0, paddingLeft: '0.15in', fontSize: '10pt', color: '#555555', lineHeight: 1.5 }}>
                                                    {responsibilities.map((resp, rIdx) => {
                                                        const cleanResp = resp.replace(/^[•\-\s]+/, '');
                                                        return <li key={rIdx} style={{ marginBottom: '0.02in' }}>{cleanResp}</li>;
                                                    })}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {data.projects && data.projects.length > 0 && (
                    <div style={{ marginBottom: '0.3in' }}>
                        <div style={{
                            backgroundColor: '#151515',
                            color: '#ffffff',
                            padding: '0.1in 0.5in',
                            fontSize: '18pt',
                            fontWeight: 'bold',
                            marginBottom: '0.2in'
                        }}>
                            Projects
                        </div>
                        <div style={{ padding: '0 0.5in', position: 'relative' }}>
                            {data.projects.length > 1 && (
                                <div style={{ position: 'absolute', top: '0.08in', bottom: '0.2in', left: '0.54in', borderLeft: '1px solid #cccccc', zIndex: 1 }}></div>
                            )}
                            {data.projects.map((proj, idx) => {
                                return (
                                    <div key={idx} style={{ display: 'flex', marginBottom: '0.2in', position: 'relative', zIndex: 2 }}>
                                        <div style={{ width: '0.2in', flexShrink: 0, marginTop: '0.05in' }}>
                                            <div style={{ width: '0.08in', height: '0.08in', backgroundColor: '#5b6270', borderRadius: '50%' }}></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '11pt', color: '#333333', fontWeight: 'bold', marginBottom: '0.02in' }}>
                                                {proj.name}
                                            </div>
                                            <div style={{ fontSize: '10pt', color: '#888888', marginBottom: '0.05in' }}>
                                                {proj.role} {proj.technologies ? `| ${proj.technologies}` : ''}
                                            </div>
                                            {proj.description && (
                                                <div style={{ fontSize: '10pt', color: '#555555', lineHeight: 1.5 }}>
                                                    {proj.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DarkRibbonModernTemplate;
