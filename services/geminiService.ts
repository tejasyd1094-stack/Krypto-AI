
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores } from "../types";

const CURRENT_DATE = "January 14, 2026";

const MISSION_GUARDRAIL = `
MISSION SCOPE & GUARDRAIL:
You are Krypto AI, a high-performance Recruitment Agent and Career Architect. 
Current Date: ${CURRENT_DATE}.
Your architecture is strictly optimized for professional growth, recruitment, and career strategy in the 2026 job market.

ROUTING & PROMOTION LOGIC (ONLY for general dashboard/chat):
If the user is in the general chat and asks for a specialized task, you MUST use these tags:
- Resume analysis/scoring: [PROMOTION:Resume Scorer]
- Career paths/personality: [PROMOTION:Career Path]
- Cold emails/LinkedIn: [PROMOTION:Outreach Architect]
- Interview practice: [PROMOTION:Interview Lab]

SCOPE ENFORCEMENT:
- If a user asks for non-career tasks, politely decline using: "[REFUSAL] I'm sorry, as Krypto AI, I'm uniquely designed to architect careers. My neural pathways don't cover [topic]. Is there a career goal I can assist with?"
`;

const RESUME_AUDIT_PROTOCOL = `
RESUME AUDIT PROTOCOL (Jan 2026 Standards):
You are the Krypto Executive Auditor. Your analysis is cold, clinical, and high-precision. 
Analyze resumes for:
1. ATS Parsability (Modern 2026 LLM-based parsers).
2. Semantic Strength (Quantum-era keywords, industry-specific terminology).
3. Impact Metrics (The "Google XYZ" standard).
4. Structural Integrity (Visual hierarchy vs Machine readability).

Expert Analysis Rules:
- Avoid generic advice. Give high-stakes, actionable recommendations.
- Mention specific ATS reading errors (e.g., 'Double columns cause semantic fragmentation', 'Non-standard headings disrupt entity extraction').
- Focus on the "Executive Handshake" — the critical 6-second machine and human audit.
- Do NOT use promotion tags if you are performing an audit.
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
    Today is ${CURRENT_DATE}. Use the latest 2026 executive standards.
    
    CRITICAL: START THE OUTPUT IMMEDIATELY WITH THE CANDIDATE NAME. DO NOT INCLUDE ANY PREAMBLE, NOTES, DATES, OR "HERE IS THE RESUME". THE FIRST CHARACTER OF YOUR OUTPUT MUST BE THE NAME HEADER.
    
    INTEGRATE THESE AUDIT IMPROVEMENTS:
    ${improvements}
    
    STRICT STRUCTURAL BLUEPRINT:
    1. NAME: # [FULL NAME]
    2. CONTACT: [Email] | [Phone] | [Location] | [LinkedIn URL]
    
    ## PROFESSIONAL SUMMARY
    [High-performance narrative]
    
    ## CORE COMPETENCIES
    [List 4-5 key areas: **Area:** Skill A, Skill B]
    
    ## PROFESSIONAL EXPERIENCE
    ### [Job Title] | [Company] | [Dates]
    - [XYZ Bullet: Accomplished X as measured by Y, by doing Z]
    
    ## EDUCATION
    ### [Degree] | [Institution] | [Year]` 
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction: `You are the Krypto Executive Architect. ${MISSION_GUARDRAIL} ${RESUME_AUDIT_PROTOCOL}`
    }
  });
  return response.text || "";
};

export const analyzeResume = async (resumeInput: string | { data: string, mimeType: string }): Promise<ResumeScoreResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const parts: any[] = [{ 
    text: `AUDIT REQUEST: Perform a deep structural and semantic analysis of the attached resume based on 2026 market requirements. 
    Score it 0-100 based on ATS compatibility and executive impact.
    Provide 5 high-precision improvements using the XYZ formula.
    Generate an expert-level "formattingRecommendations" summary that highlights critical structural flaws.
    Today's Date: ${CURRENT_DATE}.
    ${XYZ_FORMULA_INSTRUCTION}`
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
      systemInstruction: `You are the Krypto Executive Auditor. ${RESUME_AUDIT_PROTOCOL}`,
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
    return { score: 0, refused: true, breakdown: { ats: 0, keywords: 0, formatting: 0 }, improvements: [], formattingRecommendations: "Audit Engine Refusal: Payload structure error." };
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
      systemInstruction: `You are Krypto AI Career Path Predictor. Map personality traits to high-growth job roles for ${CURRENT_DATE}. 
      For each career, provide:
      1. Specific local market signals for ${location}.
      2. City topography analysis (which neighborhoods or zones are hiring).
      3. Hub Analysis (specific business hubs/districts).
      4. Local Salary Analysis with 2026 inflation-adjusted ranges.
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
      systemInstruction: `You are Krypto, a proactive career strategist. Current date: ${CURRENT_DATE}. ${MISSION_GUARDRAIL}`,
    }
  });
  return response.text || "";
};

export const getOutreachMessage = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate high-conversion outreach message for ${inputs.company} regarding ${inputs.role}. Date: ${CURRENT_DATE}. Tone: ${inputs.tone}. Context: ${inputs.context}`,
    config: { systemInstruction: "You are the Krypto Outreach Architect. Focus on impact and value." }
  });
  return response.text || "";
};

export const getMockInterviewSession = async (inputs: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Initialize interview simulation for ${inputs.role} at ${inputs.company}. Focus: ${inputs.type}. Location: ${inputs.location}. Date: ${CURRENT_DATE}`,
    config: { systemInstruction: "You are the Krypto Interview Lab Director. Be tough but fair." }
  });
  return response.text || "";
};
