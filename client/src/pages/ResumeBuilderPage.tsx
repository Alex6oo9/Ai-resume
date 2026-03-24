import { useState, useEffect, useRef } from 'react';
import { Wand2 } from 'lucide-react';
import { useNavigate, useParams, useBlocker, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ConfirmLeaveModal from '../components/shared/ConfirmLeaveModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastContext } from '../contexts/ToastContext';
import StepIndicator from '../components/resume-builder/StepIndicator';
import PersonalInfoStep from '../components/resume-builder/steps/PersonalInfoStep';
import EducationStep from '../components/resume-builder/steps/EducationStep';
import ExperienceStep from '../components/resume-builder/steps/ExperienceStep';
import SkillsStep from '../components/resume-builder/steps/SkillsStep';
import SummaryStep from '../components/resume-builder/steps/SummaryStep';
import AdditionalStep from '../components/resume-builder/steps/AdditionalStep';
import ResumePreview from '../components/live-preview/ResumePreview';
import TemplateSwitcher from '../components/templates/TemplateSwitcher';
import { buildResume, saveDraft as saveDraftApi, loadDraft as loadDraftApi, apiClient, exportPdfWithTemplate } from '../utils/api';
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
  modern: true,
};

const stepVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};
const stepTransition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

const VALID_TEMPLATE_IDS: TemplateId[] = [
  'modern', 'modern_yellow_split', 'dark_ribbon_modern',
  'modern_minimalist_block', 'editorial_earth_tone', 'ats_clean', 'ats_lined',
];

const DEMO_FORM_DATA: ResumeFormData = {
  fullName: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 234-5678',
  city: 'San Francisco',
  country: 'United States',
  linkedinUrl: 'https://linkedin.com/in/alexjohnson',
  portfolioUrl: 'https://alexjohnson.dev',
  additionalLinks: [
    { id: 'demo-1', label: 'GitHub', url: 'https://github.com/alexjohnson' },
  ],
  targetRole: 'Software Engineer',
  targetIndustry: 'Technology',
  targetCountry: 'United States',
  targetCity: 'San Francisco',
  education: [
    {
      degreeType: "Bachelor's",
      major: 'Computer Science',
      university: 'University of California, Berkeley',
      graduationDate: 'May 2024',
      gpa: '3.8',
      relevantCoursework: 'Data Structures, Algorithms, Web Development, Machine Learning, Database Systems',
      honors: "Dean's List, Cum Laude",
    },
  ],
  experience: [
    {
      type: 'internship',
      company: 'Google',
      role: 'Software Engineering Intern',
      duration: 'Jun 2023 – Aug 2023',
      responsibilities: '• Developed a real-time data pipeline using Apache Kafka reducing latency by 40%\n• Built internal tooling dashboard with React and TypeScript used by 200+ engineers\n• Collaborated with senior engineers on core search ranking algorithm improvements',
      industry: 'Technology',
    },
    {
      type: 'part-time',
      company: 'UC Berkeley Research Lab',
      role: 'Undergraduate Research Assistant',
      duration: 'Sep 2022 – May 2023',
      responsibilities: '• Implemented machine learning models in Python achieving 92% classification accuracy\n• Published findings contributing to a paper accepted at NeurIPS workshop\n• Maintained research codebase and wrote comprehensive documentation',
      industry: 'Education',
    },
  ],
  projects: [
    {
      name: 'SmartBudget — Personal Finance App',
      description: 'Full-stack web application for tracking expenses and visualizing spending patterns with AI-powered budget recommendations.',
      technologies: 'React, Node.js, PostgreSQL, OpenAI API, Chart.js',
      role: 'Solo Developer',
      link: 'https://github.com/alexjohnson/smartbudget',
    },
    {
      name: 'Campus Connect — Event Platform',
      description: 'Mobile-first platform for university students to discover and RSVP to campus events, with real-time notifications.',
      technologies: 'React Native, Firebase, Expo, Node.js',
      role: 'Lead Frontend Developer',
      link: 'https://github.com/alexjohnson/campusconnect',
    },
  ],
  skills: {
    technical: [
      { category: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL'] },
      { category: 'Frontend', items: ['React', 'Next.js', 'TailwindCSS', 'HTML/CSS'] },
      { category: 'Backend & Cloud', items: ['Node.js', 'Express', 'PostgreSQL', 'AWS', 'Docker'] },
    ],
    soft: ['Problem Solving', 'Communication', 'Teamwork', 'Time Management'],
    languages: [
      { language: 'English', proficiency: 'native' },
      { language: 'Spanish', proficiency: 'intermediate' },
    ],
  },
  professionalSummary: 'Motivated Computer Science graduate from UC Berkeley with hands-on internship experience at Google. Passionate about building scalable web applications and leveraging AI to solve real-world problems. Seeking a software engineering role where I can contribute to impactful products from day one.',
  certifications: 'AWS Certified Cloud Practitioner (2023)\nGoogle Professional Data Engineer (2024)',
  extracurriculars: 'President, Berkeley Coding Club (2022–2024) — grew membership from 30 to 120 students\nVolunteer Coding Instructor, Code.org — taught web development to 50+ high school students',
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
    languages: [],
  },
  professionalSummary: '',
  certifications: '',
  extracurriculars: '',
};

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { isDark, toggleTheme } = useTheme();
  const { id } = useParams<{ id: string }>();
  const direction = useRef<number>(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [formData, setFormData] = useState<ResumeFormData>(initialFormData);
  const [debouncedFormData, setDebouncedFormData] = useState<ResumeFormData>(initialFormData);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('modern');
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [currentTemplateName, setCurrentTemplateName] = useState<string | undefined>(undefined);
  const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasEverFinished, setHasEverFinished] = useState(false);

  // Skills auto-generation state
  const [skillsGenerated, setSkillsGenerated] = useState(false);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillsGenerationError, setSkillsGenerationError] = useState<string | null>(null);
  const [lastGeneratedRole, setLastGeneratedRole] = useState('');
  const [lastGeneratedIndustry, setLastGeneratedIndustry] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const blocker = useBlocker(hasUnsavedChanges && !isFinished);

  const isLastStep = currentStep === STEP_LABELS.length - 1;

  const {
    zoom, zoomPercent, zoomIn, zoomOut, fitToWidth,
    canZoomIn, canZoomOut, containerRef,
  } = usePreviewZoom();

  // Load template selection from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem('resumeBuilder_selectedTemplate');
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
          const fd = data.formData;
          const preCompleted = new Set<number>();
          if (fd.fullName && fd.email && fd.phone && fd.city && fd.country && fd.targetRole && fd.targetIndustry && fd.targetCountry) preCompleted.add(0);
          if (fd.education.length > 0 && fd.education[0].degreeType) preCompleted.add(1);
          preCompleted.add(2);
          preCompleted.add(3);
          if (fd.professionalSummary && fd.professionalSummary.length >= 100) preCompleted.add(4);
          preCompleted.add(5);
          setCompletedSteps(preCompleted);
        })
        .catch((err) => {
          console.error('Failed to load draft:', err);
          showToast(err?.response?.data?.error || 'Failed to load draft');
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
    setIsSaved(false);
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
      case 0:
        if (!formData.fullName.trim()) errors.push('Full Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        if (!formData.phone.trim()) errors.push('Phone is required');
        if (!formData.city.trim()) errors.push('City is required');
        if (!formData.country.trim()) errors.push('Country is required');
        if (!formData.targetRole.trim()) errors.push('Target Role is required');
        if (!formData.targetIndustry.trim()) errors.push('Target Industry is required');
        if (!formData.targetCountry.trim()) errors.push('Target Country is required');
        break;

      case 1:
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

      case 4:
        if (!formData.professionalSummary.trim()) {
          errors.push('Professional Summary is required');
        } else if (formData.professionalSummary.length < 100) {
          errors.push('Professional Summary must be at least 100 characters');
        }
        break;

      default:
        break;
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateFormData = (): string | null => {
    const step0Validation = validateStep(0);
    const step1Validation = validateStep(1);
    const step4Validation = validateStep(4);

    if (!step0Validation.isValid) return step0Validation.errors[0] + ' (Step 1)';
    if (!step1Validation.isValid) return step1Validation.errors[0] + ' (Step 2)';
    if (!step4Validation.isValid) return step4Validation.errors[0] + ' (Step 5)';

    return null;
  };

  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (!validation.isValid) {
      setStepErrors(validation.errors);
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setStepErrors([]);
    if (!isLastStep) {
      direction.current = 1;
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStepErrors([]);
    if (currentStep > 0) {
      direction.current = -1;
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinishPreview = () => {
    const validationError = validateFormData();
    if (validationError) {
      showToast(validationError);
      return;
    }
    setIsFinished(true);
    setHasEverFinished(true);
    setIsLeftPanelOpen(false);
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      const result = await buildResume({
        ...formData,
        templateId: selectedTemplate,
        resumeId: resumeId || undefined,
      } as unknown as Record<string, unknown>);
      if (!resumeId && result.resume?.id) setResumeId(result.resume.id);
      setIsSaved(true);
      setHasUnsavedChanges(false);
      showToast('Resume saved!');
    } catch (err: any) {
      showToast(err?.response?.data?.error || err?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
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
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      setSaveStatus('error');
      showToast(err?.response?.data?.error || 'Failed to save draft');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      await exportPdfWithTemplate(selectedTemplate, debouncedFormData);
    } catch (err: any) {
      showToast(err?.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const generateSkillsAutomatically = async () => {
    if (!formData.targetRole || !formData.targetIndustry) return;

    setIsGeneratingSkills(true);
    setSkillsGenerationError(null);

    try {
      const response = await apiClient.post('/ai/generate-skills', {
        targetRole: formData.targetRole,
        targetIndustry: formData.targetIndustry,
      });

      const data = response.data;

      if (data.technical?.length > 0) {
        setFormData(prev => ({
          ...prev,
          skills: {
            ...prev.skills,
            technical: data.technical,
            soft: data.soft?.length > 0
              ? [...new Set([...prev.skills.soft, ...data.soft])]
              : prev.skills.soft,
            languages: data.languages?.length > 0 && prev.skills.languages.length === 0
              ? data.languages
              : prev.skills.languages,
          },
        }));
      }

      setSkillSuggestions([]);
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

  // Auto-generate skills as soon as user leaves Personal Info (step 0 → 1+),
  // so results are ready before they reach the Skills step (step 3)
  useEffect(() => {
    if (currentStep >= 1) {
      const roleChanged = formData.targetRole !== lastGeneratedRole;
      const industryChanged = formData.targetIndustry !== lastGeneratedIndustry;
      if (!skillsGenerated || roleChanged || industryChanged) {
        generateSkillsAutomatically();
      }
    }
  }, [currentStep, formData.targetRole, formData.targetIndustry]);

  const stepComponents = [
    <PersonalInfoStep key="personal" data={formData} onChange={setFormData} photoSupported={SUPPORTS_PHOTO[selectedTemplate] ?? false} />,
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

  if (isLoadingDraft) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-sm text-muted-foreground">Loading draft...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans relative">
      {/* ── LEFT PANEL ── */}
      <div
        className={`
          flex flex-col h-full border-r border-border bg-card z-30
          shadow-[4px_0_24px_rgba(0,0,0,0.04)] shrink-0 overflow-hidden
          transition-[width] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isLeftPanelOpen
            ? 'w-screen lg:w-[45vw]'
            : 'w-20 lg:w-[280px]'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isLeftPanelOpen ? (
            <motion.div
              key="open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Logo bar — brand + dark toggle + action buttons */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
                <Link to="/" className="flex items-baseline gap-0.5">
                  <span className="text-base font-bold text-primary">ProResumeAI</span>
                  <span className="text-xs font-normal text-muted-foreground">.app</span>
                </Link>
                <div className="flex items-center gap-2">
                  {/* Dark mode toggle */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </button>

                  {/* Demo Data */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(DEMO_FORM_DATA);
                      setCompletedSteps(new Set([0, 1, 2, 3, 4, 5]));
                    }}
                    className="flex items-center gap-1.5 rounded-md border border-dashed border-muted-foreground/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    title="Fill with demo data"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Demo
                  </button>

                  {/* Save Draft */}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saveStatus === 'saving' || isSaving}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      saveStatus === 'saved'
                        ? 'bg-green-100 text-green-700'
                        : saveStatus === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {saveStatus === 'saving' && (
                      <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {saveStatus === 'saved' && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    )}
                    {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Failed' : 'Save Draft'}
                  </button>

                  {/* Collapse chevron */}
                  <button
                    type="button"
                    onClick={() => setIsLeftPanelOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    title="Collapse panel"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Title sub-bar */}
              <div className="px-5 py-2 bg-card/60 backdrop-blur-sm shrink-0">
                <h1 className="text-sm font-semibold text-foreground leading-tight">Build Your Resume</h1>
                <p className="text-xs text-muted-foreground">Fill in your info and preview in real-time</p>
              </div>

              {/* Horizontal Step Indicator */}
              <StepIndicator
                steps={STEP_LABELS}
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={(step) => {
                  direction.current = step > currentStep ? 1 : -1;
                  setStepErrors([]);
                  setCurrentStep(step);
                  setIsFinished(false);
                }}
                mode="horizontal"
              />

              {/* Form area — scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
                {/* Validation Errors */}
                {stepErrors.length > 0 && (
                  <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
                    <div className="flex items-start">
                      <svg className="h-5 w-5 text-red-400 mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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

                <AnimatePresence mode="wait" custom={direction.current} initial={false}>
                  <motion.div
                    key={currentStep}
                    custom={direction.current}
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={stepTransition}
                  >
                    {stepComponents[currentStep]}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer: Back / Next / Submit + step counter */}
              <div className="shrink-0 border-t border-border bg-card px-5 py-4">
                <div className="flex items-center justify-between">
                  {currentStep > 0 ? (
                    <motion.button
                      type="button"
                      onClick={handleBack}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                    >
                      Back
                    </motion.button>
                  ) : (
                    <div />
                  )}

                  <span className="text-xs text-muted-foreground">
                    Step {currentStep + 1} of {STEP_LABELS.length}
                  </span>

                  {isLastStep ? (
                    <motion.button
                      type="button"
                      onClick={handleFinishPreview}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Finish & Preview
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Next
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="closed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full items-center"
            >
              {/* Closed header: expand button + "Resume" label */}
              <div className="flex flex-col items-center gap-2 px-2 py-4 border-b border-border w-full shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLeftPanelOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  title="Expand panel"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
                <span className="hidden lg:block text-[10px] font-semibold tracking-widest uppercase text-muted-foreground rotate-0">
                  Edit
                </span>
              </div>

              {/* Vertical Step Indicator */}
              <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
                <StepIndicator
                  steps={STEP_LABELS}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                  onStepClick={(step) => {
                    direction.current = step > currentStep ? 1 : -1;
                    setStepErrors([]);
                    setCurrentStep(step);
                    setIsFinished(false);
                  }}
                  mode="vertical"
                  onExpandPanel={() => setIsLeftPanelOpen(true)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── RIGHT PANEL ── */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 h-full bg-muted/30 relative overflow-hidden flex flex-col"
      >
        {/* Dot pattern background */}
        <div className="absolute inset-0 pattern-dots opacity-30 text-border pointer-events-none" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20 pointer-events-none" />

        {/* Floating Toolbar */}
        <div className="absolute top-4 right-6 z-40 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-xl px-3 py-2 shadow-lg">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom out"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span className="w-10 text-center text-xs tabular-nums text-muted-foreground font-medium">{zoomPercent}%</span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Zoom in"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={fitToWidth}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Fit to width"
          >
            Fit
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Template pill */}
          <button
            type="button"
            onClick={() => setShowTemplateSwitcher(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            title="Change template"
          >
            <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            <span className="hidden sm:inline">
              {currentTemplateName
                ? currentTemplateName.replace(/_/g, ' ')
                : selectedTemplate.replace(/_/g, ' ')}
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-border mx-1" />

          {/* Save Resume — shown after Finish & Preview, and persists during editing */}
          {(isFinished || hasEverFinished) && (
            <>
              <button
                type="button"
                onClick={handleSaveResume}
                disabled={isSaving || (isSaved && !hasUnsavedChanges)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                  isSaved && !hasUnsavedChanges
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-border text-foreground hover:bg-accent'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Saving…</span>
                  </>
                ) : isSaved && !hasUnsavedChanges ? (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Saved</span>
                  </>
                ) : (
                  <span className="hidden sm:inline">{isSaved ? 'Save Changes' : 'Save Resume'}</span>
                )}
              </button>
              <div className="w-px h-5 bg-border mx-1" />
            </>
          )}

          {/* Export PDF */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            <span className="hidden sm:inline">{isExporting ? 'Exporting…' : 'Export PDF'}</span>
          </button>

        </div>

        {/* Preview content */}
        <motion.div
          key={isFinished ? 'finished' : 'editing'}
          initial={isFinished ? { opacity: 0, scale: 0.97 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 pt-16 sm:pt-20 relative z-10 overflow-hidden"
        >
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
        </motion.div>
      </motion.div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmLeaveModal
        isOpen={blocker.state === 'blocked'}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />

      {/* Template Switcher Modal */}
      {showTemplateSwitcher && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
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
