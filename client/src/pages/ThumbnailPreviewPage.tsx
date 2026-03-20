import { useSearchParams } from 'react-router-dom';
import ResumeTemplateSwitcher from '../components/templates/ResumeTemplateSwitcher';
import type { TemplateId } from '../components/templates/types';

// Sample resume data inlined to avoid cross-directory import issues in the client bundle
import type { ResumeFormData } from '../types';

const SAMPLE_RESUME_DATA: ResumeFormData = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 234-5678',
  city: 'San Francisco',
  country: 'United States',
  linkedinUrl: 'linkedin.com/in/alexjohnson',
  portfolioUrl: 'alexjohnson.dev',
  additionalLinks: [],
  profilePhoto: '/sample-photo.png',
  targetRole: 'Software Engineer',
  targetCountry: 'United States',
  targetCity: 'San Francisco',
  targetIndustry: 'Technology',

  education: [
    {
      degreeType: 'Bachelor of Science',
      major: 'Computer Science',
      university: 'University of California, Berkeley',
      graduationDate: 'May 2024',
      gpa: '3.8',
      relevantCoursework: 'Data Structures, Algorithms, Machine Learning, Distributed Systems',
      honors: 'Cum Laude',
    },
  ],

  experience: [
    {
      type: 'internship',
      company: 'Google',
      role: 'Software Engineering Intern',
      duration: 'Jun 2023 – Aug 2023',
      responsibilities:
        '- Developed a real-time data pipeline reducing latency by 35%\n- Collaborated with cross-functional teams to ship 3 product features\n- Wrote unit and integration tests achieving 92% code coverage',
      industry: 'Technology',
    },
    {
      type: 'part-time',
      company: 'UC Berkeley Research Lab',
      role: 'Undergraduate Research Assistant',
      duration: 'Sep 2022 – May 2023',
      responsibilities:
        '- Implemented NLP models for sentiment analysis with 88% accuracy\n- Published findings in IEEE undergraduate research journal',
      industry: 'Education',
    },
  ],

  projects: [
    {
      name: 'SmartBudget',
      description:
        'Full-stack personal finance app with AI-powered spending insights and automated categorization of transactions.',
      technologies: 'React, Node.js, PostgreSQL, OpenAI API',
      role: 'Lead Developer',
      link: 'github.com/alexj/smartbudget',
    },
    {
      name: 'CodeReview AI',
      description:
        'VS Code extension that provides automated code review suggestions using LLMs, with 500+ installs.',
      technologies: 'TypeScript, LangChain, OpenAI GPT-4',
      role: 'Solo Developer',
      link: 'github.com/alexj/codereview-ai',
    },
  ],

  skills: {
    technical: [
      {
        category: 'Programming Languages',
        items: ['Python', 'TypeScript', 'Java', 'Go', 'SQL'],
      },
      {
        category: 'Frameworks & Tools',
        items: ['React', 'Node.js', 'Express', 'Docker', 'Kubernetes', 'Git'],
      },
      {
        category: 'Cloud & Infrastructure',
        items: ['AWS', 'GCP', 'PostgreSQL', 'Redis', 'Terraform'],
      },
    ],
    soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Adaptability'],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Mandarin', proficiency: 'professional' },
    ],
  },

  professionalSummary:
    'Passionate software engineer with hands-on experience building scalable web applications and AI-powered tools. Strong foundation in computer science fundamentals with internship experience at top-tier tech companies.',

  certifications: 'AWS Certified Developer – Associate (2023)',
  extracurriculars: 'ACM Club President (2022–2024), Google Developer Student Club Lead',
};

const VALID_TEMPLATE_IDS: TemplateId[] = [
  'modern',
  'modern_yellow_split',
  'dark_ribbon_modern',
  'modern_minimalist_block',
  'editorial_earth_tone',
  'ats_clean',
  'ats_lined',
];

export default function ThumbnailPreviewPage() {
  const [searchParams] = useSearchParams();
  const templateParam = searchParams.get('template') ?? 'modern';
  const templateId: TemplateId = VALID_TEMPLATE_IDS.includes(templateParam as TemplateId)
    ? (templateParam as TemplateId)
    : 'modern';

  return (
    <div
      data-thumbnail-ready="true"
      style={{
        width: '816px',
        minHeight: '1056px',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
      }}
    >
      <ResumeTemplateSwitcher
        templateId={templateId}
        data={SAMPLE_RESUME_DATA}
        isPreview={false}
      />
    </div>
  );
}
