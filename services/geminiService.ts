
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores } from "../types";

const MISSION_GUARDRAIL = `
MISSION SCOPE & GUARDRAIL:
You are Krypto AI, a high-performance Recruitment Agent and Career Architect. 
Your architecture is strictly optimized for professional growth, recruitment, and career strategy.

ROUTING & PROMOTION LOGIC:
Krypto AI has specialized modules. If a user query matches one of these modules, you MUST provide a helpful suggestion and trigger a promotion.
- If the query is about improving, scoring, fixing, or analyzing a resume, use the tag: [PROMOTION:Resume Scorer]
- If the query is about finding a career path, personality tests, traits, or predicting future roles, use the tag: [PROMOTION:Career Path]
- If the query is about drafting cold emails, LinkedIn messages, or networking outreach, use the tag: [PROMOTION:Outreach Architect]
- If the query is about practicing for an interview or mock interview questions, use the tag: [PROMOTION:Interview Lab]

When promoting, say something like: "I noticed you're looking for [topic]. Our specialized [Feature Name] module is architected specifically for this with higher precision. Would you like to switch to that tool?"

SCOPE ENFORCEMENT:
- If a user asks for tasks outside of career development, recruitment, job searching, or professional networking (e.g., cooking recipes, general trivia, unrelated code), you MUST politely and empathetically decline.
- Respond with: "[REFUSAL] I'm sorry, as Krypto AI, I'm uniquely designed to architect careers and recruitment strategies. My neural pathways don't currently cover [topic], as I want to ensure 100% focus on your professional success. Is there a career-related goal I can assist with?"
`;

const XYZ_FORMULA_INSTRUCTION = 'For every improvement, convert the original experience into the "Accomplished [X] as measured by [Y], by doing [Z]" format.';

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
    
    INTEGRATE THESE AUDIT IMPROVEMENTS:
    ${improvements}
    
    STRICT STRUCTURAL BLUEPRINT (DO NOT DEVIATE):
    1. NAME: # [FULL NAME]
    2. CONTACT: [Email] | [Phone] | [Location] | [LinkedIn URL]
    
    ## PROFESSIONAL SUMMARY
    [A 4-6 line high-performance narrative focused on impact]
    
    ## CORE COMPETENCIES
    [List 4-5 key areas: **Area:** Skill A, Skill B]
    
    ## PROFESSIONAL EXPERIENCE
    ### [Job Title] | [Company] | [Dates]
    - [XYZ Bullet: Accomplished X as measured by Y, by doing Z]
    (Repeat for each major role)
    
    ## EDUCATION
    ### [Degree] | [Institution] | [Year]

    FORMATTING RULES:
    - NO HTML tags.
    - Standard Markdown only.
    - Bullet points start with "- ".
    - Use standard dashes for dates (e.g., 2021 - 2024).` 
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
    text: `${MISSION_GUARDRAIL} \n\nAnalyze this resume for ATS compatibility. Score it from 0-100. Provide 5 critical improvements. ${XYZ_FORMULA_INSTRUCTION} Response format: JSON.`
  }];
  
  if (typeof resumeInput === 'string') {
    parts.push({ text: `Resume Text: ${resumeInput}` });
  } else {
    parts.push({
      inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
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
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as ResumeScoreResponse;
  } catch (e) {
    return { score: 0, refused: true, breakdown: { ats: 0, keywords: 0, formatting: 0 }, improvements: [], formattingRecommendations: "Engine Error." };
  }
};

export const predictCareerPaths = async (
  scores: PersonalityTraitScores,
  location: string,
  userType: 'experienced' | 'fresher',
  resumeData?: string | { data: string; mimeType: string },
  fresherIntake?: any
): Promise<CareerPathResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [
    { text: `CONTEXT:\nUser Type: ${userType}\nLocation: ${location}\nRIASEC Scores: ${JSON.stringify(scores)}\nFresher Intake: ${JSON.stringify(fresherIntake)}` }
  ];

  if (resumeData) {
    if (typeof resumeData === 'string') {
      parts.push({ text: `RESUME TEXT: ${resumeData}` });
    } else {
      parts.push({ inlineData: { data: resumeData.data, mimeType: resumeData.mimeType } });
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are Krypto AI Career Path Predictor. Map personality traits to high-growth job roles. 
      For each career, provide:
      1. Specific local market signals for ${location}.
      2. City topography analysis (which neighborhoods or zones are hiring).
      3. Hub Analysis (specific business hubs/districts like 'Bandra-Kurla Complex' or 'Silicon Valley Corridor').
      4. Local Salary Analysis with precise ranges.
      5. Matches based on RIASEC profile.
      ${MISSION_GUARDRAIL}`,
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
                certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                higherEducation: { type: Type.ARRAY, items: { type: Type.STRING } },
                costEffectiveCourses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      platform: { type: Type.STRING },
                      impact: { type: Type.STRING }
                    },
                    required: ["name", "platform", "impact"]
                  }
                }
              },
              required: ["title", "reason", "matchPercentage", "salaryExpectation", "localSalaryAnalysis", "localMarketInsights", "hubAnalysis", "requiredSkills"]
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
    if (typeof fileData === 'string') {
      parts.push({ text: `ATTACHED DOCUMENT CONTENT:\n${fileData}` });
    } else {
      parts.push({ inlineData: { data: fileData.data, mimeType: fileData.mimeType } });
    }
  }
  
  parts.push({ text: `USER QUERY: ${query}` });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are Krypto, a proactive career strategist. ${MISSION_GUARDRAIL}`,
    }
  });
  return response.text || "";
};

export const getOutreachMessage = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate high-conversion outreach message for ${inputs.company} regarding ${inputs.role}. Tone: ${inputs.tone}. Context: ${inputs.context}`,
    config: { systemInstruction: "You are the Krypto Outreach Architect. Focus on impact and value." }
  });
  return response.text || "";
};

export const getMockInterviewSession = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Initialize interview simulation for ${inputs.role} at ${inputs.company}. Focus: ${inputs.type}. Location: ${inputs.location}`,
    config: { systemInstruction: "You are the Krypto Interview Lab Director. Be tough but fair." }
  });
  return response.text || "";
};
