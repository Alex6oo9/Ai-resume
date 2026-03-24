export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  file_path: string | null;
  parsed_text: string | null;
  target_role: string | null;
  target_country: string | null;
  target_city: string | null;
  match_percentage: number | null;
  ai_analysis: AiAnalysis | null;
  ats_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface ResumeFormData {
  // Step 1: Personal Information (merged Basic + Target Role)
  fullName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  additionalLinks?: AdditionalLink[]; // NEW: Up to 3 custom links
  profilePhoto?: string; // Base64 encoded image, used in photo-supporting templates
  targetRole: string;
  targetCountry: string;
  targetCity?: string;
  targetIndustry: string; // NEW: Industry dropdown

  // Step 2: Education
  education: Education[];

  // Step 3: Experience
  experience: Experience[];

  // Step 4: Projects
  projects: Project[];

  // Step 5: Skills (NEW: Nested structure for AI pre-population)
  skills: {
    technical: TechnicalSkillCategory[]; // Categorized skills
    soft: string[]; // Array of soft skills
    languages: LanguageSkill[]; // Renamed from 'languages'
  };

  // Step 6: Professional Summary (moved from Additional)
  professionalSummary: string;

  // Step 7: Additional Information
  certifications?: string;
  extracurriculars?: string;
}

export interface Education {
  degreeType: string;
  major: string;
  university: string;
  graduationDate: string;
  gpa?: string;
  relevantCoursework: string;
  honors?: string;
}

export interface Experience {
  type: 'internship' | 'part-time' | 'full-time' | 'freelance' | 'volunteer'; // Added full-time, freelance
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
  industry?: string; // NEW: Optional industry field
}

export interface Project {
  name: string;
  description: string;
  technologies: string;
  role: string;
  link?: string;
}

// Additional links for Personal Information step
export interface AdditionalLink {
  id: string;
  label: string; // free text, e.g. "GitHub", "My Blog", "Twitter"
  url: string;
}

// NEW: Technical skill category (for AI pre-population)
export interface TechnicalSkillCategory {
  category: string; // e.g., "Programming Languages", "Data Analysis"
  items: string[]; // e.g., ["Python", "JavaScript", "SQL"]
}

// NEW: Language skill with proficiency (renamed from Language for clarity)
export interface LanguageSkill {
  language: string; // e.g., "English"
  proficiency: 'native' | 'fluent' | 'professional' | 'intermediate' | 'basic';
}

// Re-export canonical TemplateId from templates module
export type { TemplateId } from '../components/templates/types';

export interface AtsScoreBreakdown {
  formatCompliance: number;
  keywordMatch: number;
  sectionCompleteness: number;
  totalScore: number;
  keywords: {
    matched: string[];
    missing: string[];
  };
}

export interface DetailedImprovements {
  actionVerbs: Array<{ current: string; suggested: string }>;
  quantifiedAchievements: Array<{ suggestion: string }>;
  missingSections: string[];
  keywordOptimization: Array<{ keyword: string; reason: string }>;
  formattingIssues: string[];
}

export interface ResumeSummary {
  id: string;
  target_role: string | null;
  target_country: string | null;
  target_city: string | null;
  match_percentage: number | null;
  ats_score: number | null;
  created_at: string;
  file_path: string | null;
  template_id: string | null;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Cover letter types
export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';
export type ProgressStep = 'idle' | 'extracting' | 'keywords-ready' | 'generating' | 'done' | 'error';

export interface Keywords {
  matched: string[];
  missing: string[];
}

export interface CoverLetter {
  id: string;
  resume_id: string | null;
  user_id: string;
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  job_title: string | null;
  job_description: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateCoverLetterPayload {
  resumeId?: string;
  resumeText?: string;
  fullName: string;
  targetRole?: string;
  targetLocation?: string;
  jobDescription: string;
  companyName: string;
  hiringManagerName?: string;
  jobTitle?: string;
  tone: CoverLetterTone;
  wordCountTarget: CoverLetterLength;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  customInstructions?: string;
}
