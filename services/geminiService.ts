import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, ResumeImprovement, WorthinessReviewResponse, WorthinessQuestionnaireResponse, SimulationMessage } from "../types";

const apiCall = async (endpoint: string, body: any) => {
  const response = await fetch(`/api/gemini/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || `HTTP error ${response.status}`);
  }
  return response.json();
};

export const getStreamingInterviewQuestion = async (
  inputs: any,
  jdData: string | null,
  historySummary: string,
  lastTwoExchanges: string,
  questionCount: number
) => {
  const data = await apiCall('interview-question', { inputs, jdData, historySummary, lastTwoExchanges, questionCount });
  return data;
};

export const getInterviewSummary = async (transcript: SimulationMessage[]) => {
  // Re-use audit for summary or create specific endpoint
  const data = await apiCall('audit-interview', { transcript, inputs: { role: 'Summary', company: 'Internal' } });
  return data.text;
};

export const auditFullInterview = async (transcript: SimulationMessage[], inputs: any) => {
  const data = await apiCall('audit-interview', { transcript, inputs });
  return data.text;
};

export const generateCareerStrategy = async (role: string, inputs: any, symbol: string, resumeData?: any) => {
  const data = await apiCall('career-strategy', { role, inputs, symbol, resumeData });
  return data.text;
};

export const generateMarketIntelligence = async (role: string, location: string, symbol: string, resumeData?: any) => {
  const data = await apiCall('market-intelligence', { role, location, symbol, resumeData });
  return data.text;
};

export const generateFormattedResume = async (
  resumeInput: any,
  improvements: ResumeImprovement[],
  auditFindings: string | undefined,
  targetCompany: string | undefined,
  targetCountry: string | undefined,
  visaStatus: string | undefined,
  visaValidTill: string | undefined
) => {
  const data = await apiCall('architect-resume', { resumeInput, improvements, auditFindings, targetCompany, targetCountry, visaStatus, visaValidTill });
  return data.text;
};

export const analyzeResume = async (resumeInput: any): Promise<ResumeScoreResponse> => {
  return apiCall('score-resume', { resumeInput });
};

export const predictCareerPaths = async (scores: PersonalityTraitScores, location: string, userType: string, resumeData?: any, currentCompensation?: string): Promise<CareerPathResponse> => {
  return apiCall('career-paths', { scores, location, userType, resumeData, currentCompensation });
};

export const getOutreachMessage = async (inputs: any, screenshotData?: any) => {
  return apiCall('outreach', { inputs, screenshotData });
};

export const getWorthinessQuestionnaire = async (inputs: any, jdData?: any): Promise<WorthinessQuestionnaireResponse> => {
  return apiCall('worth-questionnaire', { inputs, jdData });
};

export const generatePersonalizedWorthinessReview = async (inputs: any, painPoints: string, answers: any): Promise<WorthinessReviewResponse> => {
  return apiCall('worth-review', { inputs, painPoints, answers });
};

export const generateTTS = async (text: string) => {
  return apiCall('tts', { text });
};

export const parseResumeDetails = async (data?: string, mimeType?: string, text?: string) => {
  return apiCall('parse-resume', { data, mimeType, text });
};

export const analyzeVisualVibe = async (base64: string) => {
  const data = await apiCall('visual-analysis', { base64 });
  return data.text;
};

export const getChatResponse = async (messages: any[], systemInstruction: string) => {
  const data = await apiCall('chat', { messages, systemInstruction });
  return data.text;
};
