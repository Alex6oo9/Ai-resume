export type CoverLetterTone = 'professional' | 'enthusiastic' | 'formal' | 'conversational';
export type CoverLetterLength = 'short' | 'medium' | 'long';

export interface GenerateCoverLetterRequest {
  resumeId?: string;
  resumeText?: string;
  fullName: string;
  targetRole: string;
  targetLocation: string;
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

export interface ImproveRequest {
  whyThisCompany?: string;
  achievementToHighlight?: string;
}

export interface CoverLetterRecord {
  id: string;
  resume_id: string;
  user_id: string;
  content: string;
  generated_content: string;
  tone: CoverLetterTone;
  word_count_target: CoverLetterLength;
  company_name: string | null;
  hiring_manager_name: string | null;
  job_title: string | null;
  custom_instructions: string | null;
  created_at: string;
  updated_at: string;
}
