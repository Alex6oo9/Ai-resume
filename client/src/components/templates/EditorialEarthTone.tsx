// PDF-rendered: inline styles only
import type { ResumeTemplateProps } from './types';

const MailIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);
const MapPinIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);
const LinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);

export default function EditorialEarthTone({ data, isPreview: _isPreview }: ResumeTemplateProps) {
    const {
        fullName, targetRole, email, phone, city, country,
        linkedinUrl, portfolioUrl, additionalLinks, profilePhoto,
        professionalSummary, experience, education, projects, skills,
        certifications, extracurriculars
    } = data;

    const renderResponsibilities = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n').map(line => line.replace(/^[•-]\s*/, '').trim()).filter(Boolean);
        return (
            <ul style={{ margin: '0.05in 0', paddingLeft: '0.15in', listStyleType: 'none' }}>
                {lines.map((line, idx) => (
                    <li key={idx} style={{ position: 'relative', marginBottom: '0.04in' }}>
                        <span style={{ position: 'absolute', left: '-0.15in', top: '0.06in', width: '4px', height: '4px', backgroundColor: '#483930', borderRadius: '50%' }} />
                        {line}
                    </li>
                ))}
            </ul>
        );
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <div style={{ marginBottom: '0.15in', marginTop: '0.2in' }}>
            <h3 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '11pt',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#483930',
                margin: '0 0 0.05in 0'
            }}>{title}</h3>
            <div style={{ position: 'relative', height: '1px', backgroundColor: '#483930', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '3px', height: '3px', backgroundColor: '#483930', transform: 'rotate(45deg)' }} />
                <div style={{ width: '3px', height: '3px', backgroundColor: '#483930', transform: 'rotate(45deg)' }} />
            </div>
        </div>
    );

    const hasContact = email || phone || city || country || linkedinUrl || portfolioUrl || (additionalLinks && additionalLinks.length > 0);

    return (
        <div style={{
            width: '100%',
            minHeight: '100%',
            backgroundColor: '#EFEBE3',
            padding: '0',
            boxSizing: 'border-box',
            fontFamily: "'Open Sans', sans-serif",
            color: '#7A7168',
            fontSize: '9.5pt',
            lineHeight: 1.6,
            position: 'relative'
        }}>
            {/* Header: Copper & Charcoal Overlap */}
            <div style={{
                position: 'relative',
                height: '2.2in',
                overflow: 'hidden',
                marginBottom: '0.25in',
            }}>
                {/* Full-width charcoal background */}
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    width: '100%', height: '100%',
                    backgroundColor: '#EFEBE3',
                }} />

                {/* Copper nameplate — flat-left, pill-right, z-index 1 */}
                <div style={{
                    position: 'absolute',
                    left: profilePhoto ? 'calc(30% - 0.5in)' : '8%',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    minHeight: '1.05in',
                    backgroundColor: '#926340',
                    borderRadius: '0 999px 999px 0',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    paddingLeft: profilePhoto ? '1.35in' : '0.4in',
                    paddingRight: '0.6in',
                    paddingTop: '0.18in',
                    paddingBottom: '0.18in',
                }}>
                    <h1 style={{
                        fontFamily: "'Poppins', 'Montserrat', sans-serif",
                        fontSize: '28pt',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        margin: 0,
                        lineHeight: 1.1,
                        letterSpacing: '0.01em',
                    }}>
                        {fullName || 'Your Name'}
                    </h1>
                    {targetRole && (
                        <div style={{
                            fontFamily: "'Poppins', 'Montserrat', sans-serif",
                            fontSize: '11pt',
                            fontWeight: 400,
                            color: '#E0E0E0',
                            marginTop: '0.05in',
                            letterSpacing: '0.03em',
                        }}>
                            {targetRole}
                        </div>
                    )}
                </div>

                {/* Avatar — centered at the split line, z-index 2 */}
                {profilePhoto && (
                    <div style={{
                        position: 'absolute',
                        left: 'calc(30% - 0.7in)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1.4in',
                        height: '1.4in',
                        borderRadius: '50%',
                        border: '7px solid #FFFFFF',
                        boxShadow: '0 0 0 10px rgba(224,224,224,0.45)',
                        overflow: 'hidden',
                        zIndex: 2,
                        backgroundColor: '#555',
                    }}>
                        <img src={profilePhoto} alt={fullName}
                             style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div style={{ padding: '0 0.4in', display: 'flex', flexDirection: 'row' }}>

                {/* Left Column */}
                <div style={{ width: '38%', paddingRight: '0.25in', borderRight: '1px solid #483930', paddingBottom: '0.4in' }}>
                    {/* Contact Info */}
                    {hasContact && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Contact" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.07in' }}>
                                {email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><MailIcon /></span>
                                        <span style={{ wordBreak: 'break-all' }}>{email}</span>
                                    </div>
                                )}
                                {phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><PhoneIcon /></span>
                                        <span>{phone}</span>
                                    </div>
                                )}
                                {(city || country) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><MapPinIcon /></span>
                                        <span>{[city, country].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}
                                {linkedinUrl && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><LinkIcon /></span>
                                        <a href={linkedinUrl} style={{ color: 'inherit', textDecoration: 'none' }}>LinkedIn</a>
                                    </div>
                                )}
                                {portfolioUrl && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><LinkIcon /></span>
                                        <a href={portfolioUrl} style={{ color: 'inherit', textDecoration: 'none' }}>Portfolio</a>
                                    </div>
                                )}
                                {additionalLinks?.map(link => (
                                    <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '0.08in' }}>
                                        <span style={{ color: '#483930', flexShrink: 0, display: 'flex' }}><LinkIcon /></span>
                                        <a href={link.url} style={{ color: 'inherit', textDecoration: 'none' }}>{link.label || link.url}</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education && education.filter(e => e.university || e.degreeType).length > 0 && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Education" />
                            {education.filter(e => e.university || e.degreeType).map((edu, idx) => (
                                <div key={idx} style={{ marginBottom: '0.15in' }}>
                                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#483930', fontSize: '9pt', textTransform: 'uppercase' }}>
                                        {edu.degreeType} {edu.major && `in ${edu.major}`}
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#483930' }}>{edu.university}</div>
                                    <div style={{ fontSize: '8.5pt' }}>{edu.graduationDate}</div>
                                    {edu.gpa && <div style={{ fontSize: '8.5pt', marginTop: '0.02in' }}>GPA: {edu.gpa}</div>}
                                    {edu.honors && <div style={{ fontSize: '8.5pt', fontStyle: 'italic', marginTop: '0.02in' }}>{edu.honors}</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {((skills?.technical && skills.technical.length > 0) || (skills?.soft && skills.soft.length > 0) || (skills?.languages && skills.languages.length > 0)) && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Expertise" />
                            {skills?.technical && skills.technical.length > 0 && (
                                <div style={{ marginBottom: '0.1in' }}>
                                    {skills.technical.map((tech, idx) => (
                                        <div key={idx}>
                                            <div style={{ fontWeight: 700, color: '#483930', marginBottom: '2pt' }}>{tech.category}</div>
                                            <ul style={{ margin: '0 0 6pt 0', paddingLeft: '14pt', listStyleType: 'disc' }}>
                                                {tech.items.map((item, j) => (
                                                    <li key={j} style={{ fontSize: '9.5pt', lineHeight: 1.6 }}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {skills?.soft && skills.soft.length > 0 && (
                                <div style={{ marginBottom: '0.1in' }}>
                                    <div style={{ fontWeight: 700, color: '#483930', marginBottom: '2pt' }}>Soft Skills</div>
                                    <ul style={{ margin: 0, paddingLeft: '14pt', listStyleType: 'disc' }}>
                                        {skills.soft.map((item, j) => (
                                            <li key={j} style={{ fontSize: '9.5pt', lineHeight: 1.6 }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {skills?.languages && skills.languages.filter(l => l.language).length > 0 && (
                                <div style={{ marginBottom: '0.1in' }}>
                                    <div style={{ fontWeight: 700, color: '#483930', marginBottom: '0.02in' }}>Languages:</div>
                                    {skills.languages.filter(l => l.language).map((lang, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{lang.language}</span>
                                            <span style={{ fontSize: '8.5pt' }}>{lang.proficiency}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Certifications */}
                    {certifications && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Certifications" />
                            {renderResponsibilities(certifications)}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ width: '62%', paddingLeft: '0.3in', paddingBottom: '0.4in' }}>

                    {/* Summary */}
                    {professionalSummary && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="About Me" />
                            <div style={{ textAlign: 'justify' }}>
                                {professionalSummary}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Work Experience" />
                            {experience.map((exp, idx) => (
                                <div key={idx} style={{ marginBottom: '0.2in' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.02in' }}>
                                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#483930', fontSize: '10pt', textTransform: 'uppercase' }}>
                                            {exp.role}
                                        </div>
                                        <div style={{ fontSize: '8.5pt', fontWeight: 600, color: '#483930' }}>{exp.duration}</div>
                                    </div>
                                    <div style={{ fontWeight: 600, color: '#483930', marginBottom: '0.05in' }}>
                                        {exp.company}
                                    </div>
                                    <div>
                                        {renderResponsibilities(exp.responsibilities)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Selected Projects" />
                            {projects.map((proj, idx) => (
                                <div key={idx} style={{ marginBottom: '0.15in' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.02in' }}>
                                        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#483930', fontSize: '9.5pt', textTransform: 'uppercase' }}>
                                            {proj.name}
                                        </div>
                                        {proj.link && (
                                            <a href={proj.link} style={{ fontSize: '8.5pt', color: '#483930', textDecoration: 'underline' }}>View Project</a>
                                        )}
                                    </div>
                                    {proj.role && <div style={{ fontWeight: 600, color: '#483930', fontSize: '8.5pt', marginBottom: '0.02in' }}>{proj.role}</div>}
                                    <div style={{ marginBottom: '0.05in' }}>{proj.description}</div>
                                    {proj.technologies && (
                                        <div style={{ fontSize: '8.5pt' }}>
                                            <span style={{ fontWeight: 600, color: '#483930' }}>Tech:</span> {proj.technologies}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Extracurriculars */}
                    {extracurriculars && (
                        <div style={{ marginBottom: '0.2in' }}>
                            <SectionHeader title="Extracurriculars" />
                            {renderResponsibilities(extracurriculars)}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
