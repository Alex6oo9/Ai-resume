interface FormData {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  city: string;
  country: string;
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
  education: Array<{
    degreeType: string;
    major: string;
    university: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework: string;
    honors?: string;
  }>;
  experience: Array<{
    type: string;
    company: string;
    role: string;
    duration: string;
    responsibilities: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
    role: string;
    link?: string;
  }>;
  technicalSkills: string;
  softSkills: string[];
  languages: Array<{ name: string; proficiency: string }>;
  certifications?: string;
  extracurriculars?: string;
  professionalSummary: string;
}

interface BuildHtmlInput {
  formData?: FormData;
  parsedText?: string;
  targetRole?: string;
}

const CSS = `
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    margin: 0;
    padding: 0;
  }
  h1 {
    font-size: 14pt;
    margin: 0 0 4px 0;
    text-align: center;
  }
  h2 {
    font-size: 12pt;
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    margin: 12px 0 6px 0;
  }
  h3 {
    font-size: 11pt;
    margin: 6px 0 2px 0;
  }
  .contact {
    text-align: center;
    font-size: 10pt;
    margin-bottom: 4px;
  }
  .contact a {
    color: #000;
    text-decoration: none;
  }
  ul {
    margin: 2px 0 6px 0;
    padding-left: 20px;
  }
  li {
    margin-bottom: 2px;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-header .right {
    font-style: italic;
    font-size: 10pt;
  }
  p {
    margin: 2px 0;
  }
  .plain-text {
    white-space: pre-wrap;
  }
`;

export function buildResumeHtml(input: BuildHtmlInput): string {
  const { formData, parsedText, targetRole } = input;

  let bodyContent: string;

  if (formData) {
    bodyContent = buildStructuredBody(formData);
  } else if (parsedText && parsedText.trim()) {
    bodyContent = buildPlainBody(parsedText, targetRole);
  } else {
    throw new Error('No resume data provided');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>${CSS}</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildStructuredBody(data: FormData): string {
  const parts: string[] = [];

  // Name
  parts.push(`<h1>${esc(data.fullName)}</h1>`);

  // Contact line
  const contactParts = [esc(data.email), esc(data.phone)];
  if (data.city && data.country) {
    contactParts.push(`${esc(data.city)}, ${esc(data.country)}`);
  }
  const links: string[] = [];
  if (data.linkedinUrl) {
    links.push(`<a href="${esc(data.linkedinUrl)}">LinkedIn</a>`);
  }
  if (data.portfolioUrl) {
    links.push(`<a href="${esc(data.portfolioUrl)}">Portfolio</a>`);
  }
  const allContact = [...contactParts, ...links].join(' | ');
  parts.push(`<div class="contact">${allContact}</div>`);

  // Professional Summary
  if (data.professionalSummary) {
    parts.push('<h2>Professional Summary</h2>');
    parts.push(`<p>${esc(data.professionalSummary)}</p>`);
  }

  // Education
  if (data.education.length) {
    parts.push('<h2>Education</h2>');
    for (const edu of data.education) {
      parts.push('<div class="entry-header">');
      parts.push(
        `<h3>${esc(edu.degreeType)} in ${esc(edu.major)} — ${esc(edu.university)}</h3>`
      );
      parts.push(
        `<span class="right">${esc(edu.graduationDate)}</span>`
      );
      parts.push('</div>');
      const details: string[] = [];
      if (edu.gpa) details.push(`GPA: ${esc(edu.gpa)}`);
      if (edu.honors) details.push(`Honors: ${esc(edu.honors)}`);
      if (edu.relevantCoursework) {
        details.push(
          `Relevant Coursework: ${esc(edu.relevantCoursework)}`
        );
      }
      if (details.length) {
        parts.push(`<p>${details.join(' | ')}</p>`);
      }
    }
  }

  // Experience
  if (data.experience.length) {
    parts.push('<h2>Experience</h2>');
    for (const exp of data.experience) {
      parts.push('<div class="entry-header">');
      parts.push(
        `<h3>${esc(exp.role)} — ${esc(exp.company)}</h3>`
      );
      parts.push(
        `<span class="right">${esc(exp.duration)}</span>`
      );
      parts.push('</div>');
      parts.push(`<p><em>${esc(exp.type)}</em></p>`);
      const responsibilities = exp.responsibilities
        .split('\n')
        .filter((r) => r.trim());
      if (responsibilities.length) {
        parts.push('<ul>');
        for (const r of responsibilities) {
          parts.push(`<li>${esc(r.trim())}</li>`);
        }
        parts.push('</ul>');
      }
    }
  }

  // Projects
  if (data.projects.length) {
    parts.push('<h2>Projects</h2>');
    for (const proj of data.projects) {
      const nameHtml = proj.link
        ? `<a href="${esc(proj.link)}">${esc(proj.name)}</a>`
        : esc(proj.name);
      parts.push(`<h3>${nameHtml}</h3>`);
      parts.push(`<p>${esc(proj.description)}</p>`);
      parts.push(
        `<p><strong>Technologies:</strong> ${esc(proj.technologies)} | <strong>Role:</strong> ${esc(proj.role)}</p>`
      );
    }
  }

  // Skills
  parts.push('<h2>Skills</h2>');
  parts.push(
    `<p><strong>Technical:</strong> ${esc(data.technicalSkills)}</p>`
  );
  if (data.softSkills.length) {
    parts.push(
      `<p><strong>Soft Skills:</strong> ${esc(data.softSkills.join(', '))}</p>`
    );
  }
  if (data.languages.length) {
    const langs = data.languages
      .map((l) => `${esc(l.name)} (${esc(l.proficiency)})`)
      .join(', ');
    parts.push(`<p><strong>Languages:</strong> ${langs}</p>`);
  }

  // Certifications
  if (data.certifications && data.certifications.trim()) {
    parts.push('<h2>Certifications</h2>');
    parts.push(`<p>${esc(data.certifications)}</p>`);
  }

  // Extracurriculars
  if (data.extracurriculars && data.extracurriculars.trim()) {
    parts.push('<h2>Extracurricular Activities</h2>');
    parts.push(`<p>${esc(data.extracurriculars)}</p>`);
  }

  return parts.join('\n');
}

function buildPlainBody(text: string, targetRole?: string): string {
  const parts: string[] = [];
  parts.push('<h1>Resume</h1>');
  if (targetRole) {
    parts.push(`<p><strong>Target Role:</strong> ${esc(targetRole)}</p>`);
  }
  parts.push(`<div class="plain-text">${esc(text)}</div>`);
  return parts.join('\n');
}
