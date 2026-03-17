import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, ResumeImprovement, WorthinessReviewResponse, WorthinessQuestionnaireResponse, SimulationMessage } from "../types";

const CURRENT_DATE = "January 19, 2026";

const handleGenAIError = (error: any, context: string): string => {
  console.error(`Gemini API Error (${context}):`, error);
  if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.toString().includes('429')) {
    return `⚠️ **SYSTEM CAPACITY REACHED (429)**\n\nThe AI recruitment engine has exhausted its current quota. Please try again in a few minutes.`;
  }
  return `⚠️ **NEURAL NETWORK ERROR**\n\nUnable to generate response. ${error.message || 'An unexpected error occurred.'}`;
};

export const getStreamingInterviewQuestion = async (
  inputs: any,
  jdData: string | null,
  historySummary: string,
  lastAnswer: string,
  questionCount: number
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview'; 
  
  const prompt = `
    ROLE: Professional Executive Interviewer for ${inputs.company}
    TARGET POSITION: ${inputs.role}
    LOCATION: ${inputs.location || 'Unspecified'}
    PROGRESS: Question ${questionCount + 1} of 10
    
    CORE DIRECTIVES:
    1. GEOGRAPHY SENSITIVITY: Adapt questions and tone to ${inputs.location} market standards. Use regional business etiquette and industry context specific to this area.
    2. Ask ONE question at a time. Keep it simple, market-inclined, and professional.
    3. Adaptive Difficulty: If they struggle, pivot to a simpler related concept. If they excel, ask "How" or "Why".
    4. Active Listening: Acknowledge "${lastAnswer || 'initial greeting'}" briefly before the next question.
    5. Conciseness: Responses MUST be under 30 words for a natural interaction feel.
    
    INTERVIEW FLOW PLAN (15 MINS):
    - Question 1: Professional Icebreaker (Localized).
    - Question 2-7: Deep Dive into ${inputs.type.toUpperCase()} aspects (Regional Trends, Problem Solving, Skills). Use JD if available: ${jdData || 'Standard industry role'}.
    - Question 8-9: Hypothetical failure or collaboration scenario (Regional nuance).
    - Question 10: Summary and closure.

    CURRENT CONTEXT: ${historySummary}
  `;

  return ai.models.generateContentStream({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      temperature: 0.7,
    }
  });
};

export const getInterviewSummary = async (transcript: SimulationMessage[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const text = transcript.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the interview progress in exactly 20 words for state management purposes:\n\n${text}`,
  });
  return response.text || "Normal progression.";
};

export const auditFullInterview = async (transcript: SimulationMessage[], inputs: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const text = transcript.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: `
      PERFORM FULL EXECUTIVE AUDIT:
      ROLE: ${inputs.role} @ ${inputs.company}
      MARKET LOCATION: ${inputs.location || 'Global'}
      
      TRANSCRIPT:
      ${text}

      ANALYSIS MODULES REQUIRED:
      1. **OVERALL READINESS**: 0-100 score relative to ${inputs.location} hiring bars.
      2. **CRITICAL STRENGTHS**: Highlight top 3 technical/behavioral wins in this regional context.
      3. **REJECTION RISKS**: Point out red flags or gaps based on local market standards.
      4. **REGIONAL VERDICT**: Narrative summary of fit for the ${inputs.location} office/market specifically.
      
      Format in clean Markdown with BOLD metrics.
    `,
    config: {
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return response.text || "Audit failed to compile.";
};

export const generateCareerStrategy = async (
  role: string,
  inputs: { budget: string; months: string; hours: string },
  symbol: string,
  resumeData?: string | { data: string; mimeType: string }
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [
      { text: `TASK: Generate a precision career strategy for ${role}.` },
      { text: `CONSTRAINTS: Budget: ${inputs.budget} ${symbol}, Timeline: ${inputs.months} months, Daily Commitment: ${inputs.hours} hours.` }
    ];

    if (resumeData) {
      if (typeof resumeData === 'string') parts.push({ text: `RESUME: ${resumeData}` });
      else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: `You are the Krypto Strategy Architect. All monetary values must be in ${symbol}. Use bullet points.`,
      }
    });
    return response.text || "Failed.";
  } catch (e) {
    return handleGenAIError(e, 'generateCareerStrategy');
  }
};

export const generateMarketIntelligence = async (
  role: string,
  location: string,
  symbol: string,
  resumeData?: string | { data: string; mimeType: string }
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: `RESEARCH: ${role} in ${location}. Currency: ${symbol}.` }];

    if (resumeData) {
      if (typeof resumeData === 'string') parts.push({ text: `CANDIDATE: ${resumeData}` });
      else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `Krypto Market Intel. Bullet points only. Research real-time hiring trends.`,
      }
    });
    return response.text || "Failed.";
  } catch (e) {
    return handleGenAIError(e, 'generateMarketIntelligence');
  }
};

export const generateFormattedResume = async (
  resumeInput: string | { data: string, mimeType: string },
  improvements?: ResumeImprovement[],
  auditFindings?: string,
  targetCompany?: string,
  targetCountry?: string,
  visaStatus?: string,
  visaValidTill?: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    
    let prompt = "TASK: Re-architect the following resume into an Executive Blueprint.\n\n";
    
    if (auditFindings) {
      prompt += `AUDIT FINDINGS TO ADDRESS: ${auditFindings}\n\n`;
    }
    
    if (improvements && improvements.length > 0) {
      prompt += "SPECIFIC IMPROVEMENTS TO INTEGRATE:\n";
      improvements.forEach(imp => {
        prompt += `- Enhance "${imp.before}" to "${imp.after}" (Context: ${imp.why})\n`;
      });
      prompt += "\n";
    }

    if (targetCompany || targetCountry || visaStatus) {
      prompt += "TARGET CONTEXT:\n";
      if (targetCompany) prompt += `- Target Company: ${targetCompany}\n`;
      if (targetCountry) prompt += `- Target Country: ${targetCountry}\n`;
      if (visaStatus) prompt += `- Visa Status: ${visaStatus} ${visaValidTill ? `(Valid till ${visaValidTill})` : ''}\n`;
      prompt += "\n";
    }

    prompt += "ORIGINAL RESUME CONTENT BELOW:\n";
    parts.push({ text: prompt });

    if (typeof resumeInput === 'string') parts.push({ text: resumeInput });
    else parts.push({ inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType } });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: `You are the Krypto Executive Architect. Your mission is to OPTIMIZE bullet points while maintaining structural integrity.

STRICT OPERATIONAL RULES:
1. PRESERVE SUBTITLES: Keep all Company Names, Job Titles, Geographic Locations, and Employment Dates EXACTLY as they appear in the original. Do not change, hallucinate, or alter company tenure or roles.
2. ENHANCE BULLET POINTS ONLY: You are only permitted to re-engineer the descriptions and achievements listed UNDER the headers.
3. GOOGLE XYZ FORMULA: Re-write achievements using: "Accomplished [X] as measured by [Y], by doing [Z]".
4. NO DATA HALLUCINATION: If quantitative metrics (like %) are missing, use placeholders like [X%] or focus on the qualitative outcome. Do not invent fake statistics.
5. FORMATTING: Output in high-performance Markdown. Use bolding for technical skills and measurable impact. No multi-column layouts or tables.`,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });
    return response.text || "";
  } catch (e) {
    return handleGenAIError(e, 'generateFormattedResume');
  }
};

export const analyzeResume = async (resumeInput: string | { data: string, mimeType: string }): Promise<ResumeScoreResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: `AUDIT REQUEST: Deep ATS scan for 2026 standards.` }];
    if (typeof resumeInput === 'string') parts.push({ text: `Resume: ${resumeInput}` });
    else parts.push({ inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType } });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            breakdown: {
              type: Type.OBJECT,
              properties: {
                ats: { type: Type.NUMBER },
                keywords: { type: Type.NUMBER },
                formatting: { type: Type.NUMBER },
                impact: { type: Type.NUMBER },
                readability: { type: Type.NUMBER }
              },
              required: ["ats", "keywords", "formatting", "impact", "readability"]
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
                  after: { type: Type.STRING },
                  why: { type: Type.STRING }
                },
                required: ["category", "suggestion", "before", "after", "why"]
              }
            }
          },
          required: ["score", "breakdown", "formattingRecommendations", "improvements"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    return { score: 0, breakdown: { ats: 0, keywords: 0, formatting: 0, impact: 0, readability: 0 }, improvements: [], formattingRecommendations: "Error." };
  }
};

export const predictCareerPaths = async (
  scores: PersonalityTraitScores,
  location: string,
  userType: 'experienced' | 'fresher',
  resumeData?: string | { data: string; mimeType: string },
): Promise<CareerPathResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: `CONTEXT: ${userType}, ${location}, Scores: ${JSON.stringify(scores)}` }];
    if (resumeData) {
      if (typeof resumeData === 'string') parts.push({ text: `RESUME: ${resumeData}` });
      else parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
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
                }
              }
            }
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || '{}');
    return {
      personaSummary: parsed.personaSummary || 'Analysis complete.',
      careers: parsed.careers || []
    };
  } catch (e: any) {
    return { personaSummary: "Error.", careers: [] };
  }
};

export const getOutreachMessage = async (inputs: any, screenshotData?: { data: string, mimeType: string }): Promise<{ text: string, grounding?: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ text: `Outreach for ${inputs.company}.` }];
    if (screenshotData) parts.push({ inlineData: screenshotData });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { tools: [{ googleSearch: {} }] }
    });
    return { text: response.text || "Failed.", grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks };
  } catch (e) {
    return { text: "Error." };
  }
};

export const getMockInterviewSession = async (inputs: any, jdData?: string | { data: string, mimeType: string }): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Prep for ${inputs.role} @ ${inputs.company} in ${inputs.location || 'Global'}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "";
  } catch (e) {
    return "Error.";
  }
};

export const getWorthinessQuestionnaire = async (inputs: any, jdData?: string | { data: string, mimeType: string }): Promise<WorthinessQuestionnaireResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Review for ${inputs.role} @ ${inputs.company} in ${inputs.location || 'Global'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            painPoints: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { id: { type: Type.NUMBER }, text: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } } }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { questions: [], painPoints: '' };
  }
};

export const generatePersonalizedWorthinessReview = async (inputs: any, painPoints: string, answers: Record<number, string>): Promise<WorthinessReviewResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Final Verdict for ${inputs.company} in ${inputs.location || 'Global'}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            worthinessScore: { type: Type.NUMBER },
            reviewDetails: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return { worthinessScore: 0, reviewDetails: "Error." };
  }
};