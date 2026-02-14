import { generateMarkdown } from '../markdownGenerator';

describe('generateMarkdown', () => {
  const fullFormData = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-1234',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
    portfolioUrl: 'https://janedoe.dev',
    city: 'San Francisco',
    country: 'United States',
    targetRole: 'Frontend Developer',
    targetCountry: 'United States',
    targetCity: 'San Francisco',
    education: [
      {
        degreeType: 'Bachelor of Science',
        major: 'Computer Science',
        university: 'Stanford University',
        graduationDate: '2024-06',
        gpa: '3.8',
        relevantCoursework: 'Data Structures, Algorithms, Web Development',
        honors: 'Cum Laude',
      },
    ],
    experience: [
      {
        type: 'internship' as const,
        company: 'TechCorp',
        role: 'Frontend Intern',
        duration: 'Jun 2023 - Aug 2023',
        responsibilities: 'Built React components\nImproved performance by 20%',
      },
    ],
    projects: [
      {
        name: 'Portfolio Website',
        description: 'Personal portfolio built with React and TypeScript',
        technologies: 'React, TypeScript, TailwindCSS',
        role: 'Sole Developer',
        link: 'https://janedoe.dev',
      },
    ],
    technicalSkills: 'React, TypeScript, JavaScript, HTML, CSS',
    softSkills: ['Communication', 'Teamwork'],
    languages: [
      { name: 'English', proficiency: 'native' as const },
      { name: 'Spanish', proficiency: 'intermediate' as const },
    ],
    certifications: 'AWS Cloud Practitioner',
    extracurriculars: 'Computer Science Club President',
    professionalSummary:
      'Motivated CS graduate with strong frontend development skills.',
  };

  it('generates structured markdown from form data', () => {
    const result = generateMarkdown({ formData: fullFormData });

    expect(result).toContain('# Jane Doe');
    expect(result).toContain('jane@example.com');
    expect(result).toContain('555-1234');
    expect(result).toContain('linkedin.com/in/janedoe');
    expect(result).toContain('## Professional Summary');
    expect(result).toContain('Motivated CS graduate');
    expect(result).toContain('## Education');
    expect(result).toContain('Stanford University');
    expect(result).toContain('Bachelor of Science');
    expect(result).toContain('## Experience');
    expect(result).toContain('TechCorp');
    expect(result).toContain('Frontend Intern');
    expect(result).toContain('## Projects');
    expect(result).toContain('Portfolio Website');
    expect(result).toContain('## Skills');
    expect(result).toContain('React, TypeScript');
    expect(result).toContain('## Certifications');
    expect(result).toContain('AWS Cloud Practitioner');
    expect(result).toContain('## Extracurricular Activities');
    expect(result).toContain('Computer Science Club President');
  });

  it('falls back to parsed text when no form data', () => {
    const result = generateMarkdown({
      parsedText: 'John Doe\nSoftware Engineer\nExperienced developer...',
    });

    expect(result).toContain('# Resume');
    expect(result).toContain('John Doe');
    expect(result).toContain('Software Engineer');
  });

  it('includes target role when provided', () => {
    const result = generateMarkdown({
      parsedText: 'Some resume text',
      targetRole: 'Backend Developer',
    });

    expect(result).toContain('Backend Developer');
  });

  it('omits optional sections when empty', () => {
    const minimalFormData = {
      ...fullFormData,
      certifications: '',
      extracurriculars: '',
      linkedinUrl: '',
      portfolioUrl: '',
    };

    const result = generateMarkdown({ formData: minimalFormData });

    expect(result).not.toContain('## Certifications');
    expect(result).not.toContain('## Extracurricular');
    expect(result).toContain('# Jane Doe');
    expect(result).toContain('## Education');
  });

  it('throws on empty input', () => {
    expect(() => generateMarkdown({})).toThrow();
    expect(() => generateMarkdown({ parsedText: '' })).toThrow();
    expect(() => generateMarkdown({ parsedText: '   ' })).toThrow();
  });

  it('handles multiple education entries', () => {
    const data = {
      ...fullFormData,
      education: [
        ...fullFormData.education,
        {
          degreeType: 'Associate',
          major: 'Web Development',
          university: 'Community College',
          graduationDate: '2022-05',
          gpa: '',
          relevantCoursework: 'HTML, CSS, JavaScript',
          honors: '',
        },
      ],
    };

    const result = generateMarkdown({ formData: data });

    expect(result).toContain('Stanford University');
    expect(result).toContain('Community College');
  });

  it('handles multiple experience entries', () => {
    const data = {
      ...fullFormData,
      experience: [
        ...fullFormData.experience,
        {
          type: 'volunteer' as const,
          company: 'Code for Good',
          role: 'Web Developer',
          duration: 'Jan 2023 - May 2023',
          responsibilities: 'Built nonprofit websites',
        },
      ],
    };

    const result = generateMarkdown({ formData: data });

    expect(result).toContain('TechCorp');
    expect(result).toContain('Code for Good');
  });
});
