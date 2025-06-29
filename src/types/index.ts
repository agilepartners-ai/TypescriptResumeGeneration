export interface ResumeBasics {
  name: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
}

export interface EducationItem {
  institution: string;
  area: string;
  additionalAreas?: string[];
  studyType: string;
  startDate: string;
  endDate: string;
  score?: string;
  location: string;
}

export interface WorkItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  highlights: string[];
}

export interface SkillItem {
  name: string;
  keywords: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  keywords: string[];
  url?: string;
}

export interface AwardItem {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface ResumeJSON {
  basics?: ResumeBasics;
  education?: EducationItem[];
  work?: WorkItem[];
  skills?: SkillItem[];
  projects?: ProjectItem[];
  awards?: AwardItem[];
}

export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
  linkedin?: string;
}

export interface CompanyInfo {
  position: string;
  company_name: string;
  location: string;
  hiring_manager?: string;
  department?: string;
}

export interface ExtractResumeResponse {
  success: boolean;
  resume_json: ResumeJSON;
  extracted_text_length: number;
  file_id: string;
}

export interface AIAnalysis {
  match_score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keyword_analysis: {
    missing_keywords: string[];
    present_keywords: string[];
    keyword_density_score: number;
  };
  section_recommendations: {
    skills: string;
    experience: string;
    education: string;
  };
}

export interface AIEnhancements {
  enhanced_summary: string;
  enhanced_skills: string[];
  enhanced_experience_bullets: string[];
  cover_letter_outline: {
    opening: string;
    body: string;
    closing: string;
  };
}

export interface AIEnhanceResponse {
  success: boolean;
  analysis: AIAnalysis;
  enhancements: AIEnhancements;
  metadata: {
    model_used: string;
    model_type: string;
    timestamp: string;
    resume_sections_analyzed: string[];
  };
  file_id: string;
}

export interface TemplatesResponse {
  templates: string[];
  template_info: Record<string, string>;
}

export interface ApiError {
  error: string;
  file_id?: string;
}

export type ModelType = 'OpenAI' | 'DeepSeek';

export interface ProcessingState {
  isLoading: boolean;
  progress: number;
  stage: string;
  error?: string;
}