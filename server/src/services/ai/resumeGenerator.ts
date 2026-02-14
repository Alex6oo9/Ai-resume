import openai from '../../config/openai';

export interface ResumeFormInput {
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
  education: {
    degreeType: string;
    major: string;
    university: string;
    graduationDate: string;
    gpa?: string;
    relevantCoursework: string;
    honors?: string;
  }[];
  experience: {
    type: 'internship' | 'part-time' | 'volunteer';
    company: string;
    role: string;
    duration: string;
    responsibilities: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string;
    role: string;
    link?: string;
  }[];
  technicalSkills: string;
  softSkills: string[];
  languages: { name: string; proficiency: string }[];
  certifications?: string;
  extracurriculars?: string;
  professionalSummary: string;
}

export interface GenerateResumeResult {
  resumeText: string;
  matchPercentage: number;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

function formatFormDataForPrompt(data: ResumeFormInput): string {
  const lines: string[] = [];

  lines.push(`Name: ${data.fullName}`);
  lines.push(`Email: ${data.email}`);
  lines.push(`Phone: ${data.phone}`);
  if (data.linkedinUrl) lines.push(`LinkedIn: ${data.linkedinUrl}`);
  if (data.portfolioUrl) lines.push(`Portfolio: ${data.portfolioUrl}`);
  lines.push(`Location: ${data.city}, ${data.country}`);
  lines.push(`Target Role: ${data.targetRole}`);
  lines.push(
    `Target Location: ${data.targetCity ? `${data.targetCity}, ` : ''}${data.targetCountry}`
  );
  lines.push(`Professional Summary: ${data.professionalSummary}`);

  lines.push('\nEDUCATION:');
  for (const edu of data.education) {
    lines.push(`- ${edu.degreeType} in ${edu.major} at ${edu.university}`);
    lines.push(`  Graduation: ${edu.graduationDate}`);
    if (edu.gpa) lines.push(`  GPA: ${edu.gpa}`);
    lines.push(`  Coursework: ${edu.relevantCoursework}`);
    if (edu.honors) lines.push(`  Honors: ${edu.honors}`);
  }

  lines.push('\nEXPERIENCE:');
  for (const exp of data.experience) {
    lines.push(`- ${exp.role} at ${exp.company} (${exp.type})`);
    lines.push(`  Duration: ${exp.duration}`);
    lines.push(`  Responsibilities: ${exp.responsibilities}`);
  }

  lines.push('\nPROJECTS:');
  for (const proj of data.projects) {
    lines.push(`- ${proj.name}: ${proj.description}`);
    lines.push(`  Technologies: ${proj.technologies}`);
    lines.push(`  Role: ${proj.role}`);
    if (proj.link) lines.push(`  Link: ${proj.link}`);
  }

  lines.push(`\nTechnical Skills: ${data.technicalSkills}`);
  lines.push(`Soft Skills: ${data.softSkills.join(', ')}`);
  lines.push(
    `Languages: ${data.languages.map((l) => `${l.name} (${l.proficiency})`).join(', ')}`
  );
  if (data.certifications)
    lines.push(`Certifications: ${data.certifications}`);
  if (data.extracurriculars)
    lines.push(`Extracurriculars: ${data.extracurriculars}`);

  return lines.join('\n');
}

export async function generateResume(
  formData: ResumeFormInput
): Promise<GenerateResumeResult> {
  if (!formData.fullName?.trim()) {
    throw new Error('Full name is required');
  }
  if (!formData.targetRole?.trim()) {
    throw new Error('Target role is required');
  }
  if (!formData.targetCountry?.trim()) {
    throw new Error('Target country is required');
  }

  const formattedData = formatFormDataForPrompt(formData);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume writer specializing in ATS-optimized resumes for fresh graduates.
Generate a professional resume and provide analysis. Respond with ONLY valid JSON in this exact format:
{
  "resumeText": "<full resume text with proper sections>",
  "matchPercentage": <number 0-100>,
  "aiAnalysis": {
    "strengths": ["strength1", ...],
    "weaknesses": ["weakness1", ...],
    "suggestions": ["suggestion1", ...]
  }
}`,
      },
      {
        role: 'user',
        content: `Generate an ATS-optimized resume for a "${formData.targetRole}" position in ${formData.targetCity ? `${formData.targetCity}, ` : ''}${formData.targetCountry}.

Candidate Information:
${formattedData}

Requirements:
1. Generate a complete, professionally formatted resume text with clear sections: Contact, Professional Summary, Education, Experience, Projects, Skills
2. Use strong action verbs and quantify achievements where possible
3. Optimize keywords for ATS compatibility for the target role
4. Provide a match percentage (0-100) for how well this candidate fits the target role
5. List strengths, weaknesses, and improvement suggestions

Respond with ONLY valid JSON.`,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as GenerateResumeResult;
}
