import React from 'react';
import type { ResumeTemplateProps } from './types';

const IconLocation = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const IconWeb = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>;

const ModernYellowSplit: React.FC<ResumeTemplateProps> = ({ data, isPreview }) => {
    const primaryColor = "#fdb913";
    const darkBg = "#2c2c2c";

    let sectionIndex = 1;

    return (
        <div style={{
            minHeight: '100%',
            backgroundColor: '#ffffff',
            fontFamily: 'Arial, Helvetica, sans-serif',
            display: 'flex',
            flexDirection: 'row',
            boxSizing: 'border-box',
            margin: '0 auto',
            boxShadow: isPreview ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
            color: '#333',
            lineHeight: 1.5,
        }}>
            {/* Left Column */}
            <div style={{
                width: '38%',
                backgroundColor: darkBg,
                color: '#ffffff',
                padding: '29pt 0',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Photo Area */}
                {data?.profilePhoto && (
                    <div style={{ padding: '0 20pt', marginBottom: '22pt' }}>
                        <div style={{
                            backgroundColor: primaryColor,
                            borderTopLeftRadius: '1.5in',
                            borderTopRightRadius: '1.5in',
                            padding: '14pt 14pt 0 14pt',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            height: '175pt',
                        }}>
                            <img
                                src={data.profilePhoto}
                                alt="Profile"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'top',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                {((data?.city || data?.country) || data?.email || data?.phone) && (
                    <div style={{ marginBottom: '22pt' }}>
                        <div style={{ padding: '0 20pt' }}>
                            <h2 style={{
                                border: `2px solid ${primaryColor}`,
                                borderRadius: '20px',
                                padding: '0.08in 0',
                                textAlign: 'center',
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                letterSpacing: '1px',
                                marginBottom: '0.3in',
                                textTransform: 'uppercase',
                                margin: '0 0 18pt 0'
                            }}>
                                Contact Me
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11pt' }}>
                            {/* Address */}
                            {(data?.city || data?.country) && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconLocation /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>ADDRESS</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>
                                            {data.city}{data.city && data.country ? ', ' : ''}{data.country}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Web / Email */}
                            {data?.email && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconWeb /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt', wordBreak: 'break-all' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>WEB</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>{data.email}</div>
                                        {data?.portfolioUrl && <div style={{ fontSize: '9pt', color: '#e0e0e0' }}>{data.portfolioUrl}</div>}
                                        {data?.linkedinUrl && <div style={{ fontSize: '9pt', color: '#e0e0e0' }}>{data.linkedinUrl}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {data?.phone && (
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '44pt',
                                        backgroundColor: primaryColor,
                                        borderTopRightRadius: '15px',
                                        borderBottomRightRadius: '15px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        paddingRight: '7pt',
                                        paddingTop: '4pt',
                                        paddingBottom: '4pt',
                                        marginRight: '11pt'
                                    }}>
                                        <span style={{ color: '#fff' }}><IconPhone /></span>
                                    </div>
                                    <div style={{ flex: 1, paddingRight: '14pt', paddingTop: '2pt' }}>
                                        <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>PHONE</div>
                                        <div style={{ fontSize: '9pt', color: '#e0e0e0', marginTop: '2px' }}>{data.phone}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pro Skills Section */}
                {(data?.skills?.technical?.length > 0 || data?.skills?.soft?.length > 0 || data?.skills?.languages?.some((l) => l.language)) && (
                    <div style={{ padding: '0 20pt' }}>
                        <h2 style={{
                            border: `2px solid ${primaryColor}`,
                            borderRadius: '20px',
                            padding: '0.08in 0',
                            textAlign: 'center',
                            fontSize: '12pt',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            marginBottom: '0.3in',
                            textTransform: 'uppercase',
                            margin: '0 0 14pt 0'
                        }}>
                            Pro Skills
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '11pt' }}>
                            {data.skills.technical.map((skill, index) => (
                                <div key={index} style={{ fontSize: '10pt' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>{skill.category}</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '9pt' }}>
                                        {skill.items.join(', ')}
                                    </div>
                                </div>
                            ))}
                            {data.skills.soft.length > 0 && (
                                <div style={{ fontSize: '10pt' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Soft Skills</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '9pt' }}>
                                        {data.skills.soft.join(', ')}
                                    </div>
                                </div>
                            )}
                            {data.skills.languages.some((l) => l.language) && (
                                <div style={{ fontSize: '10pt' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}>Languages</div>
                                    <div style={{ color: '#e0e0e0', fontSize: '9pt' }}>
                                        {data.skills.languages.filter((l) => l.language).map((l) => `${l.language} (${l.proficiency})`).join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div style={{
                flex: 1,
                padding: '36pt 0',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header */}
                <div style={{ marginBottom: '36pt' }}>
                    {data?.targetRole && (
                        <div style={{ padding: '0 36pt', textAlign: 'center', marginBottom: '7pt' }}>
                            <h3 style={{
                                fontSize: '14pt',
                                color: '#333',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                fontWeight: 'normal'
                            }}>
                                {data.targetRole}
                            </h3>
                        </div>
                    )}
                    {data?.fullName && (
                        <div style={{
                            backgroundColor: primaryColor,
                            padding: '11pt 36pt',
                            textAlign: 'center'
                        }}>
                            <h1 style={{
                                fontSize: '28pt',
                                color: '#fff',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                                {data.fullName}
                            </h1>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 36pt', display: 'flex', flexDirection: 'column', gap: '29pt' }}>

                    {/* Profile / Summary */}
                    {data?.professionalSummary && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Profile
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555', margin: 0 }}>
                                {data.professionalSummary}
                            </p>
                        </section>
                    )}

                    {/* Education */}
                    {data?.education && data.education.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Education
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.education.map((edu, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            {edu.graduationDate && (
                                                <div style={{
                                                    backgroundColor: '#333',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    display: 'inline-block',
                                                    fontSize: '8pt',
                                                    fontWeight: 'bold',
                                                    borderRadius: '2px',
                                                    marginBottom: '4px'
                                                }}>
                                                    {edu.graduationDate}
                                                </div>
                                            )}
                                            {edu.university && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {edu.university}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {edu.degreeType} {edu.major ? `in ${edu.major}` : ''}
                                            </div>
                                            <div style={{ fontSize: '9pt', color: '#666', lineHeight: 1.5 }}>
                                                {edu.relevantCoursework}
                                                {edu.honors && <div style={{ marginTop: '2px' }}>{edu.honors}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {data?.experience && data.experience.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Experience
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            {exp.duration && (
                                                <div style={{
                                                    backgroundColor: '#333',
                                                    color: '#fff',
                                                    padding: '2px 8px',
                                                    display: 'inline-block',
                                                    fontSize: '8pt',
                                                    fontWeight: 'bold',
                                                    borderRadius: '2px',
                                                    marginBottom: '4px'
                                                }}>
                                                    {exp.duration}
                                                </div>
                                            )}
                                            {exp.company && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {exp.company}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {exp.role}
                                            </div>
                                            <ul style={{
                                                margin: 0,
                                                padding: '0 0 0 0.15in',
                                                fontSize: '9pt',
                                                color: '#666',
                                                lineHeight: 1.5
                                            }}>
                                                {exp.responsibilities?.split('\n').filter(Boolean).map((resp, i) => (
                                                    <li key={i} style={{ marginBottom: '2px' }}>
                                                        {resp.replace(/^[•\-\s]+/, '')}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data?.projects && data.projects.length > 0 && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Projects
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14pt' }}>
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} style={{ display: 'flex' }}>
                                        <div style={{ width: '101pt', flexShrink: 0 }}>
                                            <div style={{
                                                backgroundColor: '#333',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                display: 'inline-block',
                                                fontSize: '8pt',
                                                fontWeight: 'bold',
                                                borderRadius: '2px',
                                                marginBottom: '4px'
                                            }}>
                                                Project
                                            </div>
                                            {proj.role && (
                                                <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', paddingRight: '10px' }}>
                                                    {proj.role}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, paddingLeft: '14pt', borderLeft: '1px solid #ddd' }}>
                                            <div style={{ fontSize: '10pt', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px', color: '#333' }}>
                                                {proj.name}
                                            </div>
                                            <div style={{ fontSize: '9pt', color: '#666', lineHeight: 1.5 }}>
                                                {proj.description}
                                                {proj.technologies && <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#888' }}>Tech: {proj.technologies}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data?.certifications && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Certifications
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555', margin: 0 }}>
                                {data.certifications}
                            </p>
                        </section>
                    )}

                    {/* Extracurriculars */}
                    {data?.extracurriculars && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14pt' }}>
                                <div style={{
                                    width: '25pt',
                                    height: '25pt',
                                    backgroundColor: primaryColor,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#fff',
                                    fontSize: '14pt',
                                    fontWeight: 'bold',
                                    marginRight: '11pt'
                                }}>
                                    {sectionIndex++}
                                </div>
                                <h2 style={{
                                    fontSize: '14pt',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                    letterSpacing: '1px',
                                    fontWeight: 'bold'
                                }}>
                                    Activities
                                </h2>
                                <div style={{
                                    flex: 1,
                                    marginLeft: '11pt',
                                    borderBottom: `3px dotted ${primaryColor}`,
                                    opacity: 0.5
                                }} />
                            </div>
                            <p style={{ fontSize: '10pt', lineHeight: 1.6, color: '#555', margin: 0 }}>
                                {data.extracurriculars}
                            </p>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ModernYellowSplit;
