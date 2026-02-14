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
  // Step 1: Basic Information
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  city: string;
  country: string;

  // Step 2: Target Role
  targetRole: string;
  targetCountry: string;
  targetCity?: string;

  // Step 3: Education
  education: Education[];

  // Step 4: Experience
  experience: Experience[];

  // Step 5: Projects
  projects: Project[];

  // Step 6: Skills
  technicalSkills: string;
  softSkills: string[];
  languages: Language[];

  // Step 7: Additional
  certifications?: string;
  extracurriculars?: string;
  professionalSummary: string;
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
  type: 'internship' | 'part-time' | 'volunteer';
  company: string;
  role: string;
  duration: string;
  responsibilities: string;
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
