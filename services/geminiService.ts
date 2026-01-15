
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores } from "../types";

const CURRENT_DATE = "January 14, 2026";

const MISSION_GUARDRAIL = `
MISSION SCOPE & GUARDRAIL:
You are Krypto AI, a high-performance Recruitment Agent and Career Architect. 
Current Date: ${CURRENT_DATE}.
Your architecture is strictly optimized for professional growth, recruitment, and career strategy in the 2026 job market.
`;

// Centralized Error Handler
const handleGenAIError = (error: any, context: string): string => {
  console.error(`Gemini API Error (${context}):`, error);
  if (error.message?.includes('429') || error.status === 'RESOURCE_EXHAUSTED' || error.toString().includes('429')) {
    return `⚠️ **SYSTEM CAPACITY REACHED (429)**\n\nThe AI recruitment engine has exhausted its current quota. Please try again in a few minutes or switch to a personal API key in Settings.`;
  }
  return `⚠️ **NEURAL NETWORK ERROR**\n\nUnable to generate response. ${error.message || 'An unexpected error occurred.'}`;
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
        
        STRICT FORMATTING RULE: 
        - DO NOT use markdown tables under any circumstances.
        - Present all learning tracks, courses, and financial breakdowns in clean, STACKED bullet points.
        - Each item should follow the format: - **Field Name:** Description / Value.
        - Use bold highlights for course names, platforms, and estimated costs.
        
        Focus on: 
        1. Priority technical and soft skills to sharpen for ${role}.
        2. Specific high-ROI courses (mention platforms like Coursera, Udemy, edX, LinkedIn Learning, etc.) matching the user's budget (${symbol}) and timeline.
        3. Precise resume modifications tailored specifically for ${role}.
        4. A job application 'blitz' strategy to land this specific title. 
        Use Markdown with concise headers. Keep it professional and high-impact.`,
      }
    });
    return response.text || "Strategy generation failed.";
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
        
        STRICT FORMATTING RULE: 
        - DO NOT use markdown tables.
        - Present all data including "Top 4 Active Employers" and "Salary Analysis" as clean, stacked bulleted lists.
        - Format: - **Category:** Data Detail.
        
        CRITICAL FORMATTING for Employers:
        For each of the Top 4 employers include:
        - **Company Name**: Strategic fit reason.
        - **Hiring Zone**: Office location in ${location}.
        - **Key Projects/Culture**: Specific insights.
        
        Identify:
        1. Top 4 specific companies in or near ${location} currently hiring.
        2. Detailed salary ranges in ${symbol} based on local parity.
        3. Cultural audit of engineering/professional teams.
        4. Geographical Hubs pinpointed to ${location}.
        
        Provide a highly professional summary with Markdown. List sources.`,
      }
    });
    return response.text || "Intelligence audit failed.";
  } catch (e) {
    return handleGenAIError(e, 'generateMarketIntelligence');
  }
};

export const generateFormattedResume = async (
  resumeInput: string | { data: string, mimeType: string }, 
  improvements: string
): Promise<string> => {
  try {
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
  } catch (e) {
    return handleGenAIError(e, 'generateFormattedResume');
  }
};

export const analyzeResume = async (resumeInput: string | { data: string, mimeType: string }): Promise<ResumeScoreResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{ 
      text: `AUDIT REQUEST: Perform a deep structural and semantic analysis of the attached resume based on 2026 market requirements. 
      Score it 0-100 across professional benchmarks: ATS Parsability, Keyword Alignment, Impact Quantization, Structure, and Readability.
      Provide 5 high-precision improvements using the XYZ formula.
      For each improvement, include a 'why' field explaining why the change is necessary for executive-level impact.`
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
        systemInstruction: `You are the Krypto Executive Auditor. 
        Your analysis must be brutal but constructive. 
        Analyze the resume against elite recruitment standards including: 
        - Impact Quantization (Presence of metrics/numbers)
        - Keyword Alignment (Role-specific terminology)
        - Readability (Skimmability for 6-second recruiter screen)
        - ATS Parsability (Formatting compatibility)`,
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
        },
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return JSON.parse(response.text || '{}') as ResumeScoreResponse;
  } catch (e: any) {
    const isQuota = e.message?.includes('429') || e.status === 'RESOURCE_EXHAUSTED' || e.toString().includes('429');
    const msg = isQuota 
      ? "⚠️ **QUOTA EXCEEDED:** The audit engine is currently unavailable due to high traffic. Please check your API key settings." 
      : "Audit Engine Refusal: Unable to process document structure.";
    
    return { 
      score: 0, 
      refused: true, 
      breakdown: { ats: 0, keywords: 0, formatting: 0, impact: 0, readability: 0 }, 
      improvements: [], 
      formattingRecommendations: msg 
    };
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

    return JSON.parse(response.text || '{}') as CareerPathResponse;
  } catch (e: any) {
    const isQuota = e.message?.includes('429') || e.status === 'RESOURCE_EXHAUSTED' || e.toString().includes('429');
    return { 
      personaSummary: isQuota 
        ? "⚠️ **QUOTA EXCEEDED:** Career calibration unavailable. Please try again later." 
        : "Calibration error: Neural pathfinding failed.", 
      careers: [],
      refused: true 
    };
  }
};

export const getCareerAdvice = async (query: string, fileData?: string | { data: string, mimeType: string }): Promise<string> => {
  try {
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
  } catch (e) {
    return handleGenAIError(e, 'getCareerAdvice');
  }
};

export const getOutreachMessage = async (inputs: any, screenshotData?: { data: string, mimeType: string }): Promise<{ text: string, grounding?: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    
    let prompt = `Generate a truly expert, hyper-personalized outreach message for:
    Recipient Name: ${inputs.contactPerson || 'Decision Maker'}
    Role: ${inputs.role}
    Company: ${inputs.company}
    Company Website: ${inputs.website || 'N/A'}
    Advancement Info / Context: ${inputs.context || 'N/A'}
    Tone: ${inputs.tone}

    TASK:
    1. Conduct a "Google Search Study" on ${inputs.company} to find recent, high-impact advancements, news, or major project milestones that would impress a high-level professional.
    2. Analyze the provided Context/Website and incorporate specific details found during the search.
    3. If a screenshot was provided, use the visual cues of innovation or progress from that image.
    4. DRAFT THE MESSAGE: 
       - Must include Recipient's Name, Designation/Role, and Company Name.
       - The hook MUST be about a specific company advancement (found via search or context).
       - Show genuine excitement and deep research to attract a reply.
       - Tone must be expert and authoritative yet visionary.

    FINAL OUTPUT: Return the outreach message clearly with a short rationale for why this specific angle was chosen.`;

    if (screenshotData) {
      parts.push({ inlineData: screenshotData });
      prompt += `\nVISUAL ANALYTICS: The attached image contains a screenshot of a company advancement. Extract the specific innovation or metric from it and make it the focal point of the message.`;
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        systemInstruction: "You are the Krypto Outreach Architect. You generate messages with hyper-personalization that decision makers cannot ignore.",
        tools: [{ googleSearch: {} }] 
      }
    });
    
    return {
      text: response.text || "Failed to generate outreach.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (e) {
    return { text: handleGenAIError(e, 'getOutreachMessage') };
  }
};

export const getMockInterviewSession = async (inputs: any): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Initialize high-fidelity interview simulation for:
      Role: ${inputs.role}
      Organization: ${inputs.company}
      Location Context: ${inputs.location || 'Global Standard'}
      Session Type: ${inputs.type}
      Complexity Vector: ${inputs.difficulty}
      Protocol Length: ${inputs.length}

      TASK: Provide a set of high-impact interview questions tailored to these parameters. 
      For each question, provide an 'Architect's Response' — a sample high-performance answer following executive standards.
      Include insider tips for navigating this specific organization's culture.`,
      config: { systemInstruction: "You are the Krypto Interview Lab Director. You are precise, demanding, and provide only elite-level preparation materials." }
    });
    return response.text || "";
  } catch (e) {
    return handleGenAIError(e, 'getMockInterviewSession');
  }
};
