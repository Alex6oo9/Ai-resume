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

interface GenerateMarkdownInput {
  formData?: FormData;
  parsedText?: string;
  targetRole?: string;
}

export function generateMarkdown(input: GenerateMarkdownInput): string {
  const { formData, parsedText, targetRole } = input;

  if (formData) {
    return buildStructuredMarkdown(formData);
  }

  if (!parsedText || !parsedText.trim()) {
    throw new Error('No resume data provided');
  }

  return buildPlainMarkdown(parsedText, targetRole);
}

function buildStructuredMarkdown(data: FormData): string {
  const lines: string[] = [];

  // Contact Info
  lines.push(`# ${data.fullName}`);
  const contactParts: string[] = [data.email, data.phone];
  if (data.city && data.country) {
    contactParts.push(`${data.city}, ${data.country}`);
  }
  lines.push(contactParts.join(' | '));

  const links: string[] = [];
  if (data.linkedinUrl) links.push(`[LinkedIn](${data.linkedinUrl})`);
  if (data.portfolioUrl) links.push(`[Portfolio](${data.portfolioUrl})`);
  if (links.length) lines.push(links.join(' | '));

  lines.push('');

  // Professional Summary
  if (data.professionalSummary) {
    lines.push('## Professional Summary');
    lines.push(data.professionalSummary);
    lines.push('');
  }

  // Education
  if (data.education.length) {
    lines.push('## Education');
    for (const edu of data.education) {
      lines.push(
        `### ${edu.degreeType} in ${edu.major} — ${edu.university}`
      );
      lines.push(`Graduation: ${edu.graduationDate}`);
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
      if (edu.honors) lines.push(`Honors: ${edu.honors}`);
      if (edu.relevantCoursework) {
        lines.push(`Relevant Coursework: ${edu.relevantCoursework}`);
      }
      lines.push('');
    }
  }

  // Experience
  if (data.experience.length) {
    lines.push('## Experience');
    for (const exp of data.experience) {
      lines.push(`### ${exp.role} — ${exp.company}`);
      lines.push(`*${exp.type} | ${exp.duration}*`);
      const responsibilities = exp.responsibilities
        .split('\n')
        .filter((r) => r.trim());
      for (const r of responsibilities) {
        lines.push(`- ${r.trim()}`);
      }
      lines.push('');
    }
  }

  // Projects
  if (data.projects.length) {
    lines.push('## Projects');
    for (const proj of data.projects) {
      const nameWithLink = proj.link
        ? `[${proj.name}](${proj.link})`
        : proj.name;
      lines.push(`### ${nameWithLink}`);
      lines.push(proj.description);
      lines.push(`**Technologies:** ${proj.technologies}`);
      lines.push(`**Role:** ${proj.role}`);
      lines.push('');
    }
  }

  // Skills
  lines.push('## Skills');
  lines.push(`**Technical:** ${data.technicalSkills}`);
  if (data.softSkills.length) {
    lines.push(`**Soft Skills:** ${data.softSkills.join(', ')}`);
  }
  if (data.languages.length) {
    const langs = data.languages
      .map((l) => `${l.name} (${l.proficiency})`)
      .join(', ');
    lines.push(`**Languages:** ${langs}`);
  }
  lines.push('');

  // Certifications
  if (data.certifications && data.certifications.trim()) {
    lines.push('## Certifications');
    lines.push(data.certifications);
    lines.push('');
  }

  // Extracurriculars
  if (data.extracurriculars && data.extracurriculars.trim()) {
    lines.push('## Extracurricular Activities');
    lines.push(data.extracurriculars);
    lines.push('');
  }

  return lines.join('\n');
}

function buildPlainMarkdown(text: string, targetRole?: string): string {
  const lines: string[] = [];

  lines.push('# Resume');
  if (targetRole) {
    lines.push(`**Target Role:** ${targetRole}`);
  }
  lines.push('');
  lines.push(text);
  lines.push('');

  return lines.join('\n');
}
