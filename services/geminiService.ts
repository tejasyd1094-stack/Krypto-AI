
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores } from "../types";

const CURRENT_DATE = "January 14, 2026";

const MISSION_GUARDRAIL = `
MISSION SCOPE & GUARDRAIL:
You are Krypto AI, a high-performance Recruitment Agent and Career Architect. 
Current Date: ${CURRENT_DATE}.
Your architecture is strictly optimized for professional growth, recruitment, and career strategy in the 2026 job market.
`;

export const generateCareerStrategy = async (
  role: string,
  inputs: { budget: string; months: string; hours: string },
  symbol: string,
  resumeData?: string | { data: string; mimeType: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [
    { text: `TASK: Generate a high-performance career pivot strategy for the role of ${role}.` },
    { text: `CONSTRAINTS: Budget: ${inputs.budget} ${symbol}, Timeline: ${inputs.months} months, Daily Commitment: ${inputs.hours} hours. Use ${symbol} for all financial references.` }
  ];

  if (resumeData) {
    if (typeof resumeData === 'string') parts.push({ text: `RESUME CONTEXT: ${resumeData}` });
    else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are the Krypto Strategy Architect. Create a tactical plan for targeting the role: ${role}. 
      All monetary values must be presented in ${symbol}.
      Focus on: 
      1. Priority technical and soft skills to sharpen for ${role}.
      2. Specific high-ROI courses (mention platforms like Coursera, Udemy, edX, LinkedIn Learning, etc.) matching the user's budget (${symbol}) and timeline.
      3. Precise resume modifications tailored specifically for ${role}.
      4. A job application 'blitz' strategy to land this specific title. 
      Use Markdown with concise headers. Keep it professional and high-impact.`,
    }
  });
  return response.text || "Strategy generation failed.";
};

export const generateMarketIntelligence = async (
  role: string,
  location: string,
  symbol: string,
  resumeData?: string | { data: string; mimeType: string }
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [
    { text: `RESEARCH TARGET: ${role} in ${location}. Preferred currency: ${symbol}.` }
  ];

  if (resumeData) {
    if (typeof resumeData === 'string') parts.push({ text: `CANDIDATE PROFILE: ${resumeData}` });
    else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are the Krypto Market Intelligence Officer. 
      Conduct a real-time audit of the hiring landscape specifically for ${role} in ${location}.
      All salary benchmarks must use ${symbol}.
      
      CRITICAL FORMATTING:
      Reform the "Top 4 Active Employers (Strategic Fit)" section. Use clean bullet points with a header. 
      For each employer include:
      - **Company Name**: Brief strategic fit reason.
      - **Hiring Zone**: Specific office location in ${location}.
      
      Identify:
      1. Top 4 specific companies in or near ${location} currently hiring.
      2. Detailed salary ranges in ${symbol} based on local parity.
      3. Cultural audit of engineering/professional teams.
      4. Geographical Hubs pinpointed to ${location}.
      
      Provide a highly professional summary with Markdown. List sources.`,
    }
  });
  return response.text || "Intelligence audit failed.";
};

export const generateFormattedResume = async (
  resumeInput: string | { data: string, mimeType: string }, 
  improvements: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  
  if (typeof resumeInput === 'string') {
    parts.push({ text: `ORIGINAL RESUME TEXT:\n${resumeInput}` });
  } else {
    parts.push({
      inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType }
    });
    parts.push({ text: "VISUAL CONTEXT: Analyze the attached image resume for names, dates, and roles." });
  }

  parts.push({ 
    text: `TASK: Reconstruct this profile using the MANDATORY KRYPTO SIGNATURE TEMPLATE.
    Today is ${CURRENT_DATE}. Use the latest 2026 executive standards.
    CRITICAL: START THE OUTPUT IMMEDIATELY WITH THE CANDIDATE NAME.
    STRICT STRUCTURAL BLUEPRINT:
    1. NAME: # [FULL NAME]
    2. CONTACT: [Email] | [Phone] | [Location] | [LinkedIn URL]
    ## PROFESSIONAL SUMMARY
    ## CORE COMPETENCIES
    ## PROFESSIONAL EXPERIENCE
    ## EDUCATION` 
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are the Krypto Executive Architect. ${MISSION_GUARDRAIL}`
    }
  });
  return response.text || "";
};

export const analyzeResume = async (resumeInput: string | { data: string, mimeType: string }): Promise<ResumeScoreResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [{ 
    text: `AUDIT REQUEST: Perform a deep structural and semantic analysis of the attached resume based on 2026 market requirements. 
    Score it 0-100.
    Provide 5 high-precision improvements using the XYZ formula.
    Generate an expert-level "formattingRecommendations".`
  }];
  
  if (typeof resumeInput === 'string') {
    parts.push({ text: `Resume Text: ${resumeInput}` });
  } else {
    parts.push({
      inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are the Krypto Executive Auditor.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          refused: { type: Type.BOOLEAN },
          breakdown: {
            type: Type.OBJECT,
            properties: {
              ats: { type: Type.NUMBER },
              keywords: { type: Type.NUMBER },
              formatting: { type: Type.NUMBER }
            },
            required: ["ats", "keywords", "formatting"]
          },
          formattingRecommendations: { type: Type.STRING },
          improvements: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                suggestion: { type: Type.STRING },
                before: { type: Type.STRING },
                after: { type: Type.STRING }
              },
              required: ["category", "suggestion", "before", "after"]
            }
          }
        },
        required: ["score", "breakdown", "formattingRecommendations", "improvements"]
      },
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as ResumeScoreResponse;
  } catch (e) {
    return { score: 0, refused: true, breakdown: { ats: 0, keywords: 0, formatting: 0 }, improvements: [], formattingRecommendations: "Audit Engine Refusal." };
  }
};

export const predictCareerPaths = async (
  scores: PersonalityTraitScores,
  location: string,
  userType: 'experienced' | 'fresher',
  resumeData?: string | { data: string; mimeType: string },
): Promise<CareerPathResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [
    { text: `CONTEXT:\nUser Type: ${userType}\nLocation: ${location}\nRIASEC/Personality Vector Scores: ${JSON.stringify(scores)}` }
  ];

  if (resumeData) {
    if (typeof resumeData === 'string') parts.push({ text: `RESUME TEXT: ${resumeData}` });
    else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are Krypto AI Career Path Predictor. Map traits to job roles for ${CURRENT_DATE}. 
      1. Interpret scores as a DNA Code.
      2. Provide 3 specific recommendations for ${location}.
      3. For each career, list required skills and 3-4 top-tier certifications. 
      4. For certifications, explicitly include the platform name in brackets (e.g. "AWS Certified Solutions Architect [Amazon]", "Google Data Analytics [Coursera]", "Professional Certificate in Fintech [edX]", "IBM Data Science [Coursera]").
      5. Include localized salary benchmarks using appropriate regional markers.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personaSummary: { type: Type.STRING },
          careers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                matchPercentage: { type: Type.NUMBER },
                salaryExpectation: { type: Type.STRING },
                localSalaryAnalysis: { type: Type.STRING },
                localMarketInsights: { type: Type.STRING },
                hubAnalysis: { type: Type.STRING },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "reason", "matchPercentage", "salaryExpectation", "localSalaryAnalysis", "localMarketInsights", "hubAnalysis", "requiredSkills", "certifications"]
            }
          }
        },
        required: ["personaSummary", "careers"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as CareerPathResponse;
  } catch (e) {
    return { personaSummary: "Calibration error.", careers: [] };
  }
};

export const getCareerAdvice = async (query: string, fileData?: string | { data: string, mimeType: string }): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [];
  if (fileData) {
    if (typeof fileData === 'string') parts.push({ text: `FILE:\n${fileData}` });
    else parts.push({ inlineData: { data: fileData.data, mimeType: fileData.mimeType } });
  }
  parts.push({ text: `QUERY: ${query}` });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { systemInstruction: `You are Krypto career strategist. ${MISSION_GUARDRAIL}` }
  });
  return response.text || "";
};

export const getOutreachMessage = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate outreach for ${inputs.company} regarding ${inputs.role}. Tone: ${inputs.tone}.`,
    config: { systemInstruction: "You are the Krypto Outreach Architect." }
  });
  return response.text || "";
};

export const getMockInterviewSession = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Interview sim for ${inputs.role} at ${inputs.company}.`,
    config: { systemInstruction: "You are the Krypto Interview Lab Director." }
  });
  return response.text || "";
};
