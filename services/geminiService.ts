import { GoogleGenAI, Type } from "@google/genai";
import { ResumeScoreResponse, CareerPathResponse, PersonalityTraitScores, ResumeImprovement, WorthinessReviewResponse, WorthinessQuestionnaireResponse } from "../types";

const CURRENT_DATE = "January 19, 2026";

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
    
    if (typeof resumeInput === 'string') {
      parts.push({ text: `ORIGINAL RESUME TEXT:\n${resumeInput}` });
    } else {
      parts.push({
        inlineData: { data: resumeInput.data, mimeType: resumeInput.mimeType }
      });
      parts.push({ text: "VISUAL CONTEXT: Analyze the attached image resume for names, dates, and roles." });
    }

    let customizationInstruction = '';
    const useSearch = targetCompany || targetCountry;

    if (useSearch) {
        customizationInstruction += `\n\nCUSTOMIZATION DIRECTIVE: The blueprint MUST be specifically optimized for the following targets. Use Google Search to find relevant keywords, company values, and regional formatting standards. The final output MUST explicitly mention the target country and visa status in the contact information header, formatted professionally. Do NOT mention the target company in the final output.`;
        if (targetCompany) {
            customizationInstruction += `\n- **Target Company:** ${targetCompany}. Emphasize skills and achievements that align with this company's known projects, values, and industry position. Use relevant keywords from their job descriptions if possible.`;
        }
        if (targetCountry) {
            customizationInstruction += `\n- **Target Country:** ${targetCountry}. This MUST be included in the contact header. Adjust formatting, date conventions, and tone to match the professional standards of this region.`;
        }
        if (visaStatus) {
            let visaText = '';
            if (visaStatus === 'working') {
                visaText = `Working Visa (Valid until ${visaValidTill || 'N/A'})`;
            } else if (visaStatus === 'sponsorship') {
                visaText = 'Open for Visa Sponsorship';
            } else if (visaStatus === 'tourist') {
                visaText = 'Tourist Visa';
            }
            if (visaText) {
              customizationInstruction += `\n- **Visa Status:** ${visaText}. This information MUST be included in the contact header.`;
            }
        }
    }

    let improvementsInstruction = '';
    if (improvements && improvements.length > 0) {
      improvementsInstruction = `\n\nCRITICAL INTEGRATION: The following are pre-analyzed, high-impact improvements. You MUST integrate these 'after' suggestions into the final blueprint, replacing their 'before' counterparts wherever they appear in the original resume text. This is your highest priority:\n${improvements.map(imp => `- BEFORE: "${imp.before}"\n- AFTER: "${imp.after}"`).join('\n')}`;
    }

    let auditInstruction = '';
    if (auditFindings) {
      auditInstruction = `\n\nEXECUTIVE AUDIT FINDINGS: The initial audit produced the following high-level recommendation. You MUST incorporate the spirit and strategic direction of this finding into the overall tone, summary, and structure of the final document: "${auditFindings}"`;
    }

    parts.push({ 
      text: `TASK: Reconstruct the provided resume into the KRYPTO EXECUTIVE BLUEPRINT v4.0.
      This is a branded, professional, single-column, ATS-optimized resume. 
      ${customizationInstruction}
      ${auditInstruction}
      ${improvementsInstruction}

      BOLDING RULES (STRICT):
      1. Candidate's Name must be **Bold**.
      2. Contact info (City, Phone, Email, LinkedIn) must be **Bold**.
      3. Section titles (SUMMARY, KEY SKILLS, PROFESSIONAL EXPERIENCE, etc.) must be **BOLD**.
      4. Company names must be **Bold**.
      5. Locations (City, State) must be **Bold**.
      6. Tenures (Dates) must be **Bold**.
      7. Within bullet points, bold **High-Impact Words**, **Metrics**, or **Key Skills**.

      WHITESPACE & SPACING RULES (CRITICAL FOR COPY-PASTE):
      1. Add THREE (3) literal blank lines after the contact info block and before the SUMMARY section starts.
      2. Add THREE (3) literal blank lines after every SECTION TITLE (e.g., SUMMARY, KEY SKILLS, PROFESSIONAL EXPERIENCE).
      3. Add THREE (3) literal blank lines after every divider (---).
      4. Add TWO (2) literal blank lines between each separate JOB ENTRY in the Professional Experience section.
      5. Add ONE (1) literal blank line after the "Company Name | Location | Dates" line and BEFORE the first bullet point starts.
      6. Ensure there is a blank line after the last bullet point of a job and the start of the next job title.
      7. All text must be left-aligned.

      TENURE & CONCURRENCY LOGIC (CRITICAL):
      - If two jobs have overlapping date ranges, analyze the nature of the roles.
      - If one role is with an established company and the other is identified as "Freelance," "Consultant," "Personal Project," or similar independent work, the independent role's tenure line MUST be appended with "(Part-Time)".
      - For example: **[Company Name]** | **[City, State]** | **[Start Date] – [End Date] (Part-Time)**
      - Do NOT use the word "Concurrent". Only use "(Part-Time)" for the overlapping freelance/project role.

      STRICT STRUCTURAL BLUEPRINT:

# **[Full Name]**


### **[Current Title or Target Role]**


> **[City, State]** | **[Country, if provided]** | **[Visa Status & Validity, if provided]** | **[Phone Number]** | **[Email Address]** | **[LinkedIn Profile URL]**


---


## **SUMMARY**


*A concise, 3-4 sentence executive summary. Quantify impact where possible using bolded metrics like **40% increase** or **$2M saved**.*


---


## **KEY SKILLS**


- **Technical:** **Skill**, Skill, **Skill**
- **Strategic:** Skill, **Skill**, Skill
- **Tools & Platforms:** **Tool**, Platform, **Language**


---


## **PROFESSIONAL EXPERIENCE**


### **[Job Title]**


**[Company Name]** | **[City, State]** | **[Start Date] – [End Date]**


*   Accomplished **[X]** as measured by **[Y]**, by doing **[Z]**. (Bold key metrics and results).
*   Led a team of **[Number]** to achieve **[Outcome]**. (Bold the outcome).



### **[Job Title]**


**[Company Name]** | **[City, State]** | **[Start Date] – [End Date]**


*   Executed **[Task]** resulting in **[Benefit]**. (Always start with a CAPITAL letter).


---


## **EDUCATION**


### **[Degree Name]**, **[Major]**


**[University Name]** | **[City, State]** | **[Graduation Year]**


---


## **CERTIFICATIONS & AWARDS**


*   **[Certification Name]** - **[Organization]**, **[Year]**


---


> *Optimized by Krypto AI - Your Career Architect*`
    });

    const config: any = {
        systemInstruction: `You are the Krypto Executive Architect. ${MISSION_GUARDRAIL}. Your sole function is to generate a perfectly formatted, ATS-compliant resume based on the provided blueprint. Apply BOLD markers to names, contact info, headings, company names, locations, and tenures. Highlight important impact words within bullets. ENSURE ENORMOUS GAPS BETWEEN SECTIONS TO PREVENT MERGING.`
    };

    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: config
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
      text: `AUDIT REQUEST: As of today, January 19, 2026, perform a deep structural and semantic analysis of the attached resume based on current market requirements. 
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
      prompt += `\nVISUAL ANALYTICS: The attached image contains a company advancement. Extract the specific innovation or metric from it and make it the focal point of the message.`;
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

export const getMockInterviewSession = async (inputs: any, jdData?: string | { data: string, mimeType: string }): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];

    let contextText = `Initialize high-fidelity interview simulation for:
      Role: ${inputs.role}
      Organization: ${inputs.company}
      Website: ${inputs.website || 'N/A'}
      Location Context: ${inputs.location || 'Global Standard'}
      Session Type: ${inputs.type}
      Complexity Vector: ${inputs.difficulty}`;

    if (jdData) {
      if (typeof jdData === 'string') {
        contextText += `\n\nJOB DESCRIPTION (TEXT):\n${jdData}`;
      } else {
        parts.push({ inlineData: jdData });
        contextText += `\n\nJOB DESCRIPTION (IMAGE ATTACHED ABOVE): Analyze the visual data for requirements and responsibilities.`;
      }
    }

    parts.push({ text: contextText });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { 
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are the Krypto Interview Lab Director. You are precise and provide only elite-level preparation.
        
        CRITICAL VALIDATION STEP:
        If a Job Description (JD) was provided (either text or image), analyze it for "Responsibilities" or "Required Skills".
        If the JD does NOT contain job-related duties (e.g. it is a blank page, a meme, or unrelated text), you MUST start your response with "[INVALID_JD]" followed by a professional request for the user to upload a valid document.

        INTELLIGENCE GATHERING:
        1. Use Google Search to find recent interview patterns, reviews (Glassdoor, Indeed, Reddit), and cultural insights for ${inputs.company}.
        2. Analyze the Role and JD to tailor technical questions specifically to the responsibilities listed.

        OUTPUT TASK:
        - Your primary mission is to generate the **most critical and impactful** interview questions based on the simulation settings. The number of questions should be determined by what is most effective, not a fixed count.
        - The tone, difficulty, and content of both the questions and the 'Architect's Response' MUST directly reflect the **Session Type (${inputs.type})** and **Complexity Vector (${inputs.difficulty})**.
        - **'entry' complexity:** Focus on foundational concepts, STAR method basics, and enthusiasm.
        - **'standard' complexity:** Provide a mix of advanced situational questions (for behavioral), deep technical challenges (for technical), and nuanced cultural fit inquiries.
        - **'stress-test' complexity:** Create highly challenging, multi-layered, and potentially ambiguous questions designed to push a candidate's limits on logic, composure, and strategic thinking.
        - **'written' session type:** The simulation MUST be a written assessment. Generate 2-3 complex, situational prompts that require a detailed written response (e.g., drafting a professional email to a difficult stakeholder, writing a short project proposal, or creating a brief incident report). The 'Architect's Response' should be a complete, well-formatted example of the required document.
        - For each question, provide an 'Architect's Response' — a sample high-performance answer following executive standards appropriate to the complexity.
        - Include 'Insider Signal' tips for navigating this specific organization's culture based on your search results.
        - If JD is valid, do NOT include the [INVALID_JD] tag.`
      }
    });
    return response.text || "";
  } catch (e) {
    return handleGenAIError(e, 'getMockInterviewSession');
  }
};

export const getWorthinessQuestionnaire = async (inputs: any, jdData?: string | { data: string, mimeType: string }): Promise<WorthinessQuestionnaireResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [];
    let contextText = `Initial scan for role: ${inputs.role} at company: ${inputs.company}. Website: ${inputs.website}`;
    
    if (jdData) {
      if (typeof jdData === 'string') contextText += `\n\nJOB DESCRIPTION (TEXT):\n${jdData}`;
      else parts.push({ inlineData: jdData });
    }
    parts.push({ text: contextText });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are a Krypto Intelligence Analyst specializing in psychometrics and organizational dynamics.
        1. Use Google Search to find the top 3-4 critical, data-backed pain points, cultural challenges, or common reasons for attrition for the role of "${inputs.role}" at "${inputs.company}" (or similar roles in the industry if specific data is unavailable).
        2. Summarize these findings into a concise string for the 'painPoints' field.
        3. Based ONLY on these findings, formulate a 3-question multiple-choice questionnaire. Each question must present a complex, difficult scenario related to a pain point you discovered.
        4. Crucially, you MUST include one question (preferably the last one) that probes the user's attitude towards navigating internal company politics or conflicts between teams, based on any intel found about the company's culture. This question is the most important.
        5. CRITICAL INSTRUCTION FOR OPTIONS: The answer options must be carefully designed to avoid an obvious "correct" choice. Each option should represent a different, yet professionally plausible, archetype or approach. For example:
            - An option focused on **Process & Stability** (following the rules, ensuring documentation, risk mitigation).
            - An option focused on **Innovation & Disruption** (challenging the status quo, trying a new method, speed over perfection).
            - An option focused on **Collaboration & Harmony** (seeking consensus, prioritizing team morale, stakeholder management).
            - An option focused on **Pragmatism & Individual Action** (taking ownership, delivering a solution quickly, even if it's not perfect).
            The goal is to subtly map the user's core attitude, not test their knowledge of professional etiquette. The final 'options' array must contain only the plain text for each choice, without any archetype labels (e.g., 'Process & Stability') or markdown formatting like asterisks.
        6. Return a JSON object with 'painPoints' and 'questions'.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            painPoints: {
              type: Type.STRING,
              description: "A summary of the discovered critical pain points and challenges for the role."
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "text", "options"]
              }
            }
          },
          required: ["painPoints", "questions"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as WorthinessQuestionnaireResponse;
  } catch (e) {
    console.error("Worthiness Questionnaire Error", e);
    return {
      questions: [],
      painPoints: '',
      refused: true,
      refusalReason: `### Scan Failed\n\n**REASON:** ${handleGenAIError(e, 'getWorthinessQuestionnaire')}`
    };
  }
};

export const generatePersonalizedWorthinessReview = async (inputs: any, painPoints: string, answers: Record<number, string>): Promise<WorthinessReviewResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const parts: any[] = [{
      text: `Final Analysis for role: "${inputs.role}" at company: "${inputs.company}".
      
      PREVIOUSLY IDENTIFIED PAIN POINTS:
      ${painPoints}

      CANDIDATE'S ATTITUDINAL RESPONSES:
      ${JSON.stringify(answers, null, 2)}

      TASK:
      1. Analyze the candidate's answers to gauge their resilience, problem-solving approach, and cultural fit in the face of the known pain points. Pay special attention to the user's answer regarding company politics or conflict (likely the last question); this response should heavily influence the final score as it indicates crucial cultural fit and longevity.
      2. Generate a personalized 'Worthiness Score' from 0-100 based on this alignment. A high score means their attitude is well-suited to handle the role's specific challenges.
      3. Write a detailed markdown report. The report MUST begin with the following disclaimer, exactly as written:
      "**Disclaimer:** This Worthiness Score is not a generic market summary. It is a personalized index calculated by simulating your attitudinal responses against real-world, data-driven challenges specific to this role and organization."
      4. The report should then explain the score, referencing the user's answers and how they map to the challenges. Use the headers: "### Key Pain Points & Challenges" (reiterate them), "### Your Simulated Performance", and "### Final Verdict".`
    }];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: `You are the Krypto Intelligence Analyst. Your task is to generate a personalized Worthiness Score and report by mapping a candidate's explicit answers to known role-specific challenges. The score and analysis MUST be tailored and not generic. The answer to the question about politics/conflict is the most significant indicator and should be weighted more heavily in your final calculation.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            worthinessScore: {
              type: Type.NUMBER,
              description: "A personalized score from 0-100 based on the candidate's answers vs. pain points."
            },
            reviewDetails: {
              type: Type.STRING,
              description: `A detailed Markdown report starting with the mandatory disclaimer, followed by the analysis.`
            }
          },
          required: ["worthinessScore", "reviewDetails"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as WorthinessReviewResponse;
  } catch (e) {
    console.error("Personalized Worthiness Review Error", e);
    return {
      worthinessScore: 0,
      refused: true,
      reviewDetails: `### Analysis Blocked\n\n**REASON:** ${handleGenAIError(e, 'generatePersonalizedWorthinessReview')}`
    };
  }
};
