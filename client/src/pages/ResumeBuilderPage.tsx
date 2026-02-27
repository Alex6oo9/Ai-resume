import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToastContext } from '../contexts/ToastContext';
import StepIndicator from '../components/resume-builder/StepIndicator';
import PersonalInfoStep from '../components/resume-builder/steps/PersonalInfoStep';
import EducationStep from '../components/resume-builder/steps/EducationStep';
import ExperienceStep from '../components/resume-builder/steps/ExperienceStep';
import SkillsStep from '../components/resume-builder/steps/SkillsStep';
import SummaryStep from '../components/resume-builder/steps/SummaryStep';
import AdditionalStep from '../components/resume-builder/steps/AdditionalStep';
import ResumePreview from '../components/live-preview/ResumePreview';
import UploadProgress, {
  UploadStatus,
} from '../components/resume-upload/UploadProgress';
import TemplateSwitcher from '../components/templates/TemplateSwitcher';
import { buildResume, saveDraft as saveDraftApi, loadDraft as loadDraftApi, apiClient } from '../utils/api';
import { usePreviewZoom } from '../hooks/usePreviewZoom';
import type { ResumeFormData } from '../types';
import type { TemplateId } from '../components/templates/types';

const STEP_LABELS = [
  'Personal Info',
  'Education',
  'Experience',
  'Skills',
  'Summary',
  'Additional',
];

const SUPPORTS_PHOTO: Record<string, boolean> = {
  modern_minimal: true,
  creative_bold: true,
  professional_classic: true,
  healthcare_pro: true,
  warm_creative: true,
  sleek_director: true,
  modern_yellow_split: true,
  dark_ribbon_modern: true,
  modern_minimalist_block: true,
  editorial_earth_tone: true,
};

const initialFormData: ResumeFormData = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  country: '',
  linkedinUrl: '',
  portfolioUrl: '',
  additionalLinks: [],
  targetRole: '',
  targetIndustry: '',
  targetCountry: '',
  targetCity: '',
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
  skills: {
    technical: [],
    soft: [],
    languages: [{ language: '', proficiency: 'basic' }],
  },
  professionalSummary: '',
  certifications: '',
  extracurriculars: '',
};

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { id } = useParams<{ id: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
  const [debouncedFormData, setDebouncedFormData] = useState<ResumeFormData>(initialFormData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern_minimal');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [status, setStatus] = useState<UploadStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [currentTemplateName, setCurrentTemplateName] = useState<string | undefined>(undefined);
  const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // Skills auto-generation state
  const [skillsGenerated, setSkillsGenerated] = useState(false);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillsGenerationError, setSkillsGenerationError] = useState<string | null>(null);
  const [lastGeneratedRole, setLastGeneratedRole] = useState('');
  const [lastGeneratedIndustry, setLastGeneratedIndustry] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  const {
    zoom, zoomPercent, zoomIn, zoomOut, fitToWidth,
    canZoomIn, canZoomOut, containerRef,
  } = usePreviewZoom();

  // Load template selection from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('resumeBuilder_selectedTemplate');
    const VALID_TEMPLATE_IDS: TemplateId[] = [
      'modern_minimal', 'creative_bold', 'professional_classic',
      'tech_focused', 'healthcare_pro', 'warm_creative', 'sleek_director',
    ];
    if (savedTemplate && (VALID_TEMPLATE_IDS as string[]).includes(savedTemplate)) {
      setSelectedTemplate(savedTemplate as TemplateId);
    }
  }, []);

  // Load draft if id is provided in URL
  useEffect(() => {
    if (id) {
      setIsLoadingDraft(true);

      loadDraftApi(id)
        .then((data) => {
          setFormData(data.formData);
          setDebouncedFormData(data.formData);
          setResumeId(id);
          setHasUnsavedChanges(false);
          showToast('Draft loaded successfully');
          // Pre-mark steps as completed based on filled data
          const fd = data.formData;
          const preCompleted = new Set<number>();
          if (fd.fullName && fd.email && fd.phone && fd.city && fd.country && fd.targetRole && fd.targetIndustry && fd.targetCountry) preCompleted.add(0);
          if (fd.education.length > 0 && fd.education[0].degreeType) preCompleted.add(1);
          preCompleted.add(2); // Experience is optional
          preCompleted.add(3); // Skills is optional
          if (fd.professionalSummary && fd.professionalSummary.length >= 100) preCompleted.add(4);
          preCompleted.add(5); // Additional is optional
          setCompletedSteps(preCompleted);
        })
        .catch((err) => {
          console.error('Failed to load draft:', err);
          showToast(err?.response?.data?.error || 'Failed to load draft');
          // Navigate to empty builder on error
          navigate('/build');
        })
        .finally(() => {
          setIsLoadingDraft(false);
        });
    }
  }, [id, navigate, showToast]);

  // Save template selection to localStorage on change
  useEffect(() => {
    localStorage.setItem('resumeBuilder_selectedTemplate', selectedTemplate);
  }, [selectedTemplate]);

  // Debounce form data updates for preview (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFormData(formData);
    }, 300);

    return () => clearTimeout(timer);
  }, [formData]);

  // Mark any step as visited the moment we arrive on it
  useEffect(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
  }, [currentStep]);

  // Track unsaved changes when form data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData]);

  // Warn before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const validateStep = (stepIndex: number): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    switch (stepIndex) {
      case 0: // Personal Info
        if (!formData.fullName.trim()) errors.push('Full Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        if (!formData.phone.trim()) errors.push('Phone is required');
        if (!formData.city.trim()) errors.push('City is required');
        if (!formData.country.trim()) errors.push('Country is required');
        if (!formData.targetRole.trim()) errors.push('Target Role is required');
        if (!formData.targetIndustry.trim()) errors.push('Target Industry is required');
        if (!formData.targetCountry.trim()) errors.push('Target Country is required');
        break;

      case 1: // Education
        if (formData.education.length === 0) {
          errors.push('At least one education entry is required');
        } else {
          const firstEdu = formData.education[0];
          if (!firstEdu.degreeType.trim()) errors.push('Degree Type is required');
          if (!firstEdu.major.trim()) errors.push('Major/Field of Study is required');
          if (!firstEdu.university.trim()) errors.push('University is required');
          if (!firstEdu.graduationDate.trim()) errors.push('Graduation Date is required');
        }
        break;

      case 4: // Summary
        if (!formData.professionalSummary.trim()) {
          errors.push('Professional Summary is required');
        } else if (formData.professionalSummary.length < 100) {
          errors.push('Professional Summary must be at least 100 characters');
        }
        break;

      // Steps 2 (Experience), 3 (Skills), 5 (Additional) are optional
      default:
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateFormData = (): string | null => {
    // Validate all required steps for final submission
    const step0Validation = validateStep(0);
    const step1Validation = validateStep(1);
    const step4Validation = validateStep(4);

    if (!step0Validation.isValid) return step0Validation.errors[0] + ' (Step 1)';
    if (!step1Validation.isValid) return step1Validation.errors[0] + ' (Step 2)';
    if (!step4Validation.isValid) return step4Validation.errors[0] + ' (Step 5)';

    return null;
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const validation = validateStep(currentStep);

    if (!validation.isValid) {
      setStepErrors(validation.errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Mark current step as completed, clear errors, and advance
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setStepErrors([]);
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStepErrors([]);
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
        { ...formData, templateId: selectedTemplate } as unknown as Record<string, unknown>
      );
      setStatus('success');
      setHasUnsavedChanges(false);
      showToast('Resume generated successfully');
      setTimeout(() => navigate(`/resume/${result.resume.id}`), 1500);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.response?.data?.error || err?.message || 'Something went wrong'
      );
    }
  };

  const handleSaveDraft = async () => {
    setSaveStatus('saving');

    try {
      const result = await saveDraftApi(
        formData as unknown as Record<string, unknown>,
        resumeId || undefined
      );

      if (!resumeId && result.resumeId) {
        setResumeId(result.resumeId);
      }

      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      showToast('Draft saved successfully');

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err?.response?.data?.error || 'Failed to save draft');

      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const generateSkillsAutomatically = async () => {
    if (!formData.targetRole || !formData.targetIndustry) {
      return; // Skip if no role/industry set
    }

    setIsGeneratingSkills(true);
    setSkillsGenerationError(null);

    try {
      const response = await apiClient.post('/ai/generate-skills', {
        targetRole: formData.targetRole,
        targetIndustry: formData.targetIndustry,
      });

      // Flatten all AI-generated skills into a single suggestion list
      const suggestions: string[] = [];

      // Add technical skills only (soft skills covered by hardcoded SOFT_SKILL_OPTIONS toggles)
      if (response.data.technical) {
        response.data.technical.forEach((category: any) => {
          if (category.items) {
            suggestions.push(...category.items);
          }
        });
      }

      // Skip response.data.soft — already covered by hardcoded SOFT_SKILL_OPTIONS toggles

      // Add languages
      if (response.data.languages) {
        response.data.languages.forEach((lang: any) => {
          if (lang.language) {
            suggestions.push(`${lang.language} (${lang.proficiency})`);
          }
        });
      }

      setSkillSuggestions(suggestions.slice(0, 15));
      setSkillsGenerated(true);
      setLastGeneratedRole(formData.targetRole);
      setLastGeneratedIndustry(formData.targetIndustry);
    } catch (err: any) {
      setSkillsGenerationError(
        err?.response?.data?.error || 'Failed to generate skills. Please try again.'
      );
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  // Auto-generate skills when entering Skills step
  useEffect(() => {
    // Trigger when entering Skills step (step 3)
    if (currentStep === 3) {
      const roleChanged = formData.targetRole !== lastGeneratedRole;
      const industryChanged = formData.targetIndustry !== lastGeneratedIndustry;

      // Generate if: first time OR role/industry changed
      if (!skillsGenerated || roleChanged || industryChanged) {
        generateSkillsAutomatically();
      }
    }
  }, [currentStep, formData.targetRole, formData.targetIndustry]);

  const stepComponents = [
    <PersonalInfoStep key="personal" data={formData} onChange={setFormData} showPhotoUpload={SUPPORTS_PHOTO[selectedTemplate] ?? false} />,
    <EducationStep key="edu" data={formData} onChange={setFormData} />,
    <ExperienceStep key="exp" data={formData} onChange={setFormData} />,
    <SkillsStep
      key="skills"
      data={formData}
      onChange={setFormData}
      isGenerating={isGeneratingSkills}
      generationError={skillsGenerationError}
      targetRole={formData.targetRole}
      targetIndustry={formData.targetIndustry}
      onRegenerate={generateSkillsAutomatically}
      suggestions={skillSuggestions}
    />,
    <SummaryStep key="summary" data={formData} onChange={setFormData} />,
    <AdditionalStep key="additional" data={formData} onChange={setFormData} />,
  ];

  // Loading state while fetching draft
  if (isLoadingDraft) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <span className="text-sm text-gray-500">Loading draft...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4 shadow-sm lg:px-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Build Your Resume</h1>
              <p className="mt-1 text-sm text-gray-600">
                Fill in your information and see your resume update in real-time
              </p>
            </div>

            <div className="flex items-center gap-2">
            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saveStatus === 'saving' || status === 'analyzing'}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                saveStatus === 'saved'
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : saveStatus === 'error'
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {saveStatus === 'saving' && (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Saved
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Save Failed
                </>
              )}
              {saveStatus === 'idle' && 'Save Draft'}
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (visible only on mobile/tablet) */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-2 lg:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'edit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mobileTab === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:grid lg:grid-cols-[minmax(400px,35%)_1fr] lg:gap-6 lg:px-6">
        {/* Left Panel - Form */}
        <div className={`lg:overflow-y-auto ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <StepIndicator
            steps={STEP_LABELS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={(step) => {
              setStepErrors([]);
              setCurrentStep(step);
            }}
          />

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Validation Errors */}
            {stepErrors.length > 0 && (
              <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-start">
                  <svg
                    className="h-5 w-5 text-red-400 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following {stepErrors.length === 1 ? 'error' : 'errors'}:
                    </h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                      {stepErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {stepComponents.map((step, index) => (
              <div
                key={index}
                style={{ display: currentStep === index ? '' : 'none' }}
                aria-hidden={currentStep !== index}
              >
                {step}
              </div>
            ))}

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

        {/* Right Panel - Live Preview */}
        <div className={`${mobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
          <div className="sticky top-6 h-[calc(100vh-8rem)] overflow-hidden rounded-lg">
            <ResumePreview
              data={debouncedFormData}
              templateId={selectedTemplate}
              onChooseTemplate={() => setShowTemplateSwitcher(true)}
              currentTemplateName={currentTemplateName}
              zoom={zoom}
              zoomPercent={zoomPercent}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onFitToWidth={fitToWidth}
              canZoomIn={canZoomIn}
              canZoomOut={canZoomOut}
              containerRef={containerRef}
            />
          </div>
        </div>
      </div>

      {/* Template Switcher Modal */}
      {showTemplateSwitcher && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <TemplateSwitcher
              resumeId={resumeId ?? undefined}
              currentTemplateName={currentTemplateName}
              onTemplateChanged={(template) => {
                setCurrentTemplateName(template.name);
                setSelectedTemplate(template.name as TemplateId);
              }}
              onClose={() => setShowTemplateSwitcher(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
