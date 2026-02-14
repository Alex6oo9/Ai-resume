import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import StepIndicator from '../components/resume-builder/StepIndicator';
import BasicInfoStep from '../components/resume-builder/steps/BasicInfoStep';
import TargetRoleStep from '../components/resume-builder/steps/TargetRoleStep';
import EducationStep from '../components/resume-builder/steps/EducationStep';
import ExperienceStep from '../components/resume-builder/steps/ExperienceStep';
import ProjectsStep from '../components/resume-builder/steps/ProjectsStep';
import SkillsStep from '../components/resume-builder/steps/SkillsStep';
import AdditionalStep from '../components/resume-builder/steps/AdditionalStep';
import UploadProgress, {
  UploadStatus,
} from '../components/resume-upload/UploadProgress';
import { buildResume } from '../utils/api';
import type { ResumeFormData } from '../types';

const STEP_LABELS = [
  'Basic Info',
  'Target Role',
  'Education',
  'Experience',
  'Projects',
  'Skills',
  'Additional',
];

const initialFormData: ResumeFormData = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  targetRole: '',
  targetCountry: '',
  education: [
    {
      degreeType: '',
      major: '',
      university: '',
      graduationDate: '',
      relevantCoursework: '',
    },
  ],
  experience: [],
  projects: [],
  technicalSkills: '',
  softSkills: [],
  languages: [{ name: '', proficiency: 'basic' }],
  professionalSummary: '',
};

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  const validateFormData = (): string | null => {
    if (!formData.fullName.trim()) return 'Full Name is required (Step 1)';
    if (!formData.email.trim()) return 'Email is required (Step 1)';
    if (!formData.phone.trim()) return 'Phone is required (Step 1)';
    if (!formData.targetRole.trim()) return 'Target Role is required (Step 2)';
    if (!formData.targetCountry.trim())
      return 'Target Country is required (Step 2)';
    if (formData.education.length === 0)
      return 'At least one education entry is required (Step 3)';
    if (!formData.professionalSummary.trim())
      return 'Professional Summary is required (Step 7)';
    return null;
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');

    const validationError = validateFormData();
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setStatus('analyzing');

    try {
      const result = await buildResume(
        formData as unknown as Record<string, unknown>
      );
      setStatus('success');
      showToast('Resume generated successfully');
      setTimeout(() => navigate(`/resume/${result.resume.id}`), 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.response?.data?.error || err?.message || 'Something went wrong'
      );
    }
  };

  const stepComponents = [
    <BasicInfoStep key="basic" data={formData} onChange={setFormData} />,
    <TargetRoleStep key="target" data={formData} onChange={setFormData} />,
    <EducationStep key="edu" data={formData} onChange={setFormData} />,
    <ExperienceStep key="exp" data={formData} onChange={setFormData} />,
    <ProjectsStep key="proj" data={formData} onChange={setFormData} />,
    <SkillsStep key="skills" data={formData} onChange={setFormData} />,
    <AdditionalStep key="additional" data={formData} onChange={setFormData} />,
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Build Your Resume
      </h1>

      <StepIndicator steps={STEP_LABELS} currentStep={currentStep} />

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {stepComponents[currentStep]}

        <div className="mt-6 flex justify-between">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={status !== null && status !== 'error'}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'analyzing' ? 'Generating...' : 'Submit & Generate'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {status && (
        <div className="mt-4">
          <UploadProgress status={status} errorMessage={errorMessage} />
        </div>
      )}
    </div>
  );
}
