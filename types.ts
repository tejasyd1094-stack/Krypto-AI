export type TabType = 'Home' | 'Profile & Roadmap' | 'Resume Scorer' | 'Career Path' | 'Outreach Architect' | 'Interview Lab' | 'History' | 'Pricing' | 'Consultation' | 'Credit System' | 'Simulation' | 'Lab-ATS' | 'Lab-Career' | 'Lab-Outreach' | 'Lab-Interview' | 'FAQ' | 'Refer' | 'Feedback';
export type PlanId = 'free' | 'starter' | 'pro' | 'ultra-pro';

export interface SimulationMessage {
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
}

export interface ProfileMetadata {
  avatarUrl?: string;
  name?: string;
  email?: string;
  phone?: string;
  currentCompany?: string;
  currentDesignation?: string;
  education?: {
    graduate?: string;
    masters?: string;
  };
  resumeData?: string | { data: string; mimeType: string };
  resumeFileName?: string;
  compensation?: {
    fixed: string;
    variable: string;
  };
  noticePeriod?: string;
}

export interface ProfileTasks {
  profilePic: boolean;
  resumeAdded: boolean;
  compAdded: boolean;
  noticeAdded: boolean;
  scorerUsed: boolean;
  careerUsed: boolean;
  outreachUsed: boolean;
  interviewUsed: boolean;
}

export interface HistoryItem {
  id: string;
  type: 'strategy' | 'market-insight' | 'outreach' | 'interview-prep' | 'resume-audit' | 'worthiness-review' | 'interview-simulation';
  title: string;
  date: string;
  inputs: Record<string, string>;
  result: string;
  score?: number;
  breakdown?: { 
    ats: number; 
    keywords: number; 
    formatting: number; 
    impact: number;       
    readability: number;  
  };
  improvements?: ResumeImprovement[];
  optimizedResult?: string;
}

export interface UserStatus {
  isPro: boolean;
  planId: PlanId;
  credits: number;
  trialUsed: boolean;
  location?: string;
  currency: string;
  symbol: string;
  history: HistoryItem[];
  profile?: ProfileMetadata;
  tasks: ProfileTasks;
  redeemedCode?: string;
}

export interface FeatureAccess {
  canAccessLocalSalary: boolean;
  canAccessDeepPersona: boolean;
  maxImprovements: number;
  priorityCoach: boolean;
}

export interface PricingPlan {
  id: PlanId;
  name: string;
  price: number | string;
  credits: number | string;
  features: string[];
  isPopular?: boolean;
  paymentLink?: string; 
}

export interface PersonalityTrait {
  id: string;
  label: string;
  description: string;
}

export interface InterviewPrepItem {
  question: string;
  answer: string;
}

export interface ResumeImprovement {
  category: string;
  suggestion: string;
  before: string;
  after: string;
  why: string; 
}

export interface ResumeScoreResponse {
  score: number;
  breakdown: { 
    ats: number; 
    keywords: number; 
    formatting: number; 
    impact: number;       
    readability: number;  
  };
  improvements: ResumeImprovement[];
  formattingRecommendations: string;
  refused?: boolean;
}

export interface CareerPathRecommendation {
  title: string;
  reason: string;
  matchPercentage: number;
  salaryExpectation: string;
  percentageIncrease?: string;
  localSalaryAnalysis: string;
  localMarketInsights: string; 
  hubAnalysis: string;         
  requiredSkills: string[];
  certifications: string[];
  higherEducation: string[];
  costEffectiveCourses: { name: string; platform: string; impact: string; }[];
}

export interface CareerPathResponse {
  personaSummary: string;
  careers: CareerPathRecommendation[];
  refused?: boolean;
}

export interface PersonalityTraitScores {
  analytic: number;
  creative: number;
  leadership: number;
  social: number;
  practical: number;
  investigative: number;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: { text: string; traits: Partial<PersonalityTraitScores>; }[];
}

export interface WorthinessQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface WorthinessQuestionnaireResponse {
  questions: WorthinessQuestion[];
  painPoints: string;
  refused?: boolean;
  refusalReason?: string;
}

export interface WorthinessReviewResponse {
  worthinessScore: number;
  reviewDetails: string;
  refused?: boolean;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  file?: { name: string };
  action?: {
    tab: TabType;
    label: string;
  };
  suggestions?: string[];
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  date: string;
  messages: Message[];
}