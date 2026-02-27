import { useEffect } from 'react';
import type { ResumeFormData } from '../../types';
import ResumeTemplateSwitcher from '../templates/ResumeTemplateSwitcher';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
}

/**
 * Sample resume data for template preview
 */
const SAMPLE_DATA: ResumeFormData = {
  fullName: 'Jane Smith',
  email: 'jane.smith@email.com',
  phone: '+1 (555) 123-4567',
  city: 'San Francisco',
  country: 'United States',
  linkedinUrl: 'linkedin.com/in/janesmith',
  portfolioUrl: 'janesmith.dev',
  additionalLinks: [
    { id: '1', label: 'GitHub', url: 'github.com/janesmith' },
  ],
  targetRole: 'Junior Software Engineer',
  targetIndustry: 'Technology',
  targetCountry: 'United States',
  targetCity: 'San Francisco',
  education: [
    {
      degreeType: 'B.S.',
      major: 'Computer Science',
      university: 'University of California, Berkeley',
      graduationDate: 'May 2024',
      relevantCoursework:
        'Data Structures, Algorithms, Database Systems, Web Development, Machine Learning',
    },
  ],
  experience: [
    {
      type: 'internship',
      company: 'Tech Innovations Inc.',
      role: 'Software Engineering Intern',
      duration: 'Jun 2023 - Aug 2023',
      industry: 'Technology',
      responsibilities:
        'Developed and deployed 3 new features using React and Node.js\nCollaborated with senior engineers on code reviews and testing\nImproved application performance by 25% through optimization',
    },
    {
      type: 'part-time',
      company: 'University IT Department',
      role: 'Student Developer',
      duration: 'Sep 2022 - May 2023',
      industry: 'Education',
      responsibilities:
        'Built internal tools for student services using Python and Flask\nMaintained university website with 10,000+ monthly visitors\nProvided technical support to faculty and staff',
    },
  ],
  projects: [
    {
      name: 'Task Management App',
      description:
        'Full-stack web application for team task management with real-time updates and collaboration features',
      technologies: 'React, TypeScript, Node.js, PostgreSQL, Socket.io',
      role: 'Full-stack Developer',
      link: 'github.com/janesmith/task-app',
    },
    {
      name: 'Weather Forecast API',
      description:
        'RESTful API providing weather forecasts with data from multiple sources',
      technologies: 'Python, Flask, Redis, Docker',
      role: 'Backend Developer',
      link: 'github.com/janesmith/weather-api',
    },
  ],
  skills: {
    technical: [
      {
        category: 'Programming Languages',
        items: ['JavaScript', 'Python', 'TypeScript', 'SQL', 'Java'],
      },
      {
        category: 'Frameworks & Libraries',
        items: ['React', 'Node.js', 'Express', 'Flask', 'TailwindCSS'],
      },
      {
        category: 'Tools & Technologies',
        items: ['Git', 'Docker', 'PostgreSQL', 'MongoDB', 'AWS'],
      },
    ],
    soft: [
      'Communication',
      'Teamwork',
      'Problem Solving',
      'Time Management',
      'Adaptability',
    ],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Spanish', proficiency: 'intermediate' },
    ],
  },
  professionalSummary:
    'Recent Computer Science graduate from UC Berkeley with hands-on experience in full-stack development through internships and academic projects. Proficient in JavaScript, Python, and modern web technologies with demonstrated ability to build scalable applications. Seeking Junior Software Engineer position to leverage technical skills and contribute to innovative projects in the Technology industry.',
  certifications: 'AWS Cloud Practitioner, Google Analytics Certified',
  extracurriculars:
    'President of Computer Science Club, Hackathon organizer, Volunteer coding instructor',
};

/**
 * TemplatePreviewModal Component
 *
 * Full-screen modal that shows a template preview with sample data.
 * Allows users to see how a template looks before selecting it.
 */
export default function TemplatePreviewModal({ isOpen, onClose, templateId }: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 flex h-full w-full max-w-4xl flex-col p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between rounded-t-lg bg-white px-4 py-3 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900">Template Preview</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Preview — template owns its own padding */}
        <div className="flex-1 overflow-y-auto rounded-b-lg bg-gray-100 p-6">
          <div className="mx-auto bg-white shadow-2xl overflow-hidden" style={{ width: '8.5in', minHeight: '11in' }}>
            <ResumeTemplateSwitcher templateId={templateId} data={SAMPLE_DATA} isPreview />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-300">
          Press ESC or click outside to close
        </div>
      </div>
    </div>
  );
}
