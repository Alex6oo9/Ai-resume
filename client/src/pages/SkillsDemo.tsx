import { useState } from 'react';
import SkillsStep from '../components/resume-builder/steps/SkillsStep';
import type { ResumeFormData } from '../types';

export default function SkillsDemo() {
  const [formData, setFormData] = useState<ResumeFormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedinUrl: '',
    portfolioUrl: '',
    targetRole: 'Full Stack Developer',
    targetIndustry: 'Technology',
    targetCountry: '',
    targetCity: '',
    education: [],
    experience: [],
    projects: [],
    skills: {
      technical: [
        { category: 'Programming Languages', items: ['Python', 'JavaScript', 'TypeScript', 'Java'] },
        { category: 'Frameworks', items: ['React', 'Node.js', 'Express', 'Django'] },
        { category: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB'] },
      ],
      soft: ['Communication', 'Teamwork', 'Problem Solving', 'Adaptability', 'Time Management'],
      languages: [
        { language: 'English', proficiency: 'fluent' },
        { language: 'Spanish', proficiency: 'intermediate' },
      ],
    },
    professionalSummary: '',
    certifications: '',
    extracurriculars: '',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Skills Step Demo</h1>
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <SkillsStep
            data={formData}
            onChange={setFormData}
            isGenerating={false}
            generationError={null}
            targetRole="Full Stack Developer"
            targetIndustry="Technology"
            onRegenerate={() => console.log('Regenerate clicked')}
          />
        </div>
      </div>
    </div>
  );
}
