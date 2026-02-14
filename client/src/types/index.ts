export interface User {
  id: string;
  email: string;
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

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

// NEW: Additional links for Personal Information step
export interface AdditionalLink {
  id: string;
  label: 'GitHub' | 'Behance' | 'Medium' | 'Dribbble' | 'YouTube' | 'Custom';
  customLabel?: string; // Only used if label === 'Custom'
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

// Template types (for live preview)
export type TemplateId = 'ats' | 'simple';

export interface Template {
  id: TemplateId;
  name: string;
  description: string;
  thumbnail: string;
  isPremium: boolean;
}

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
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}
