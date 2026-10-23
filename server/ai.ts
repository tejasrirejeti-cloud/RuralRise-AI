/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import { BusinessPlan, Language, UserProfile } from '../src/types/index.js';
import { WARANGAL_OPPORTUNITIES, GOVERNMENT_SCHEMES, WARANGAL_MARKET_EVIDENCE } from './data/warangalData.js';

export interface AIRefinementResult {
  strengths: string[];
  localGroundTips: string[];
  suggestedActionSteps: string[];
  lastRefinedAt: string;
  source: 'gemini-3.8-flash';
}

export interface ChatMessageInput {
  role: 'user' | 'model';
  content: string;
}

export interface AssistantChatResult {
  reply: string;
  sources: Array<{ name: string; url: string }>;
  source: 'gemini-3.8-flash';
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    throw new Error(
      'AI service configuration missing: GEMINI_API_KEY is not configured on the server. You can still explore the Warangal opportunity catalog, verified government schemes, and financial calculator directly in the app.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

export async function refineBusinessPlanWithAI(plan: BusinessPlan): Promise<AIRefinementResult> {
  const ai = getGeminiClient();

  // Validate plan has minimal required fields
  if (!plan.title || !plan.concept?.summary) {
    throw new Error('Please fill in at least the plan title and concept summary before requesting AI refinement.');
  }

  const systemPrompt = `You are a senior rural enterprise analyst specializing in Warangal District, Telangana, India.
Analyze the user's rural micro-enterprise business plan.
Strict instructions:
1. Be evidence-grounded, practical, respectful, and realistic.
2. DO NOT make unverified claims, invent financial returns, or fabricate loan approval guarantees.
3. Reference real Warangal district factors (e.g. Enumamula market yard for agro-commodities, DIC Warangal in Industrial Estate, local transport corridors like NH-163, power considerations, water availability, or seasonal harvest cycles).
4. Identify any missing information or critical risks the entrepreneur must verify on the ground.
5. Provide:
   - 3 specific strengths of the proposed concept.
   - 2 practical Warangal-specific ground reality tips.
   - 3 concrete action steps the entrepreneur should execute next.

Return ONLY a valid JSON object matching this exact structure:
{
  "strengths": ["string", "string", "string"],
  "localGroundTips": ["string", "string"],
  "suggestedActionSteps": ["string", "string", "string"]
}`;

  const planPayload = {
    title: plan.title,
    locationMandal: plan.concept.locationMandal || 'Warangal District',
    conceptSummary: plan.concept.summary,
    productOrService: plan.concept.productServiceDescription,
    targetCustomers: plan.market.targetCustomers,
    salesChannels: plan.market.salesChannels,
    operationsAndEquipment: plan.operations.equipmentList,
    rawMaterialSources: plan.operations.rawMaterialSources,
    capitalNeededINR: plan.financials.capitalNeeded,
    projectedMonthlyRevenueINR: plan.financials.monthlyProjectedRevenue,
    projectedMonthlyExpensesINR: plan.financials.monthlyProjectedExpenses,
    applicableSchemes: plan.applicableSchemes
  };

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI analysis timed out after 15 seconds. Please check your connectivity and retry.')), 15000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nPlan Details for Analysis:\n${JSON.stringify(planPayload, null, 2)}` }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error('The AI model returned an empty response. Please verify plan inputs and try again.');
    }

    const parsed = JSON.parse(responseText);

    if (
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.localGroundTips) ||
      !Array.isArray(parsed.suggestedActionSteps)
    ) {
      throw new Error('AI analysis produced an unexpected structure. Please retry.');
    }

    return {
      strengths: parsed.strengths.filter((s: any) => typeof s === 'string').slice(0, 4),
      localGroundTips: parsed.localGroundTips.filter((s: any) => typeof s === 'string').slice(0, 3),
      suggestedActionSteps: parsed.suggestedActionSteps.filter((s: any) => typeof s === 'string').slice(0, 4),
      lastRefinedAt: new Date().toISOString(),
      source: 'gemini-3.8-flash'
    };
  } catch (err: any) {
    console.error('Gemini API refinement failed:', err);
    throw new Error(err.message || 'AI analysis request failed. Please check network connectivity and API quota.');
  }
}

/**
 * Builds the grounded system instruction for RuralRise AI Assistant
 */
function buildAssistantSystemInstruction(
  language: Language,
  profile?: Partial<UserProfile>,
  currentTab?: string,
  opportunityId?: string
): string {
  // Extract catalog summaries
  const opportunitiesSummary = WARANGAL_OPPORTUNITIES.map(o => 
    `- ${o.titleEn} (${o.titleTe}): Min Capital ₹${o.minCapitalINR.toLocaleString('en-IN')}, Max Capital ₹${o.maxCapitalINR.toLocaleString('en-IN')}. Focus: ${o.summaryEn}. Advantage: ${o.localWarangalAdvantageEn}`
  ).join('\n');

  // Extract schemes summaries
  const schemesSummary = GOVERNMENT_SCHEMES.map(s =>
    `- ${s.name}: ${s.subsidyOrAssistanceEn}. Portal: ${s.portalUrl}. Warangal Office: ${s.localWarangalOffice}. Key criteria: ${s.eligibilityCriteriaEn.join('; ')}`
  ).join('\n');

  // Extract evidence facts
  const evidenceSummary = WARANGAL_MARKET_EVIDENCE.map(e =>
    `- ${e.titleEn} (${e.headlineMetric}): ${e.metricDescriptionEn}. Source: ${e.sourceName} (${e.sourceUrl})`
  ).join('\n');

  // Safe user profile context (strictly no tokens or sensitive data)
  let userContextText = 'Anonymous visitor (no profile submitted).';
  if (profile) {
    userContextText = `Mandal: ${profile.mandal || 'Warangal'}, Starting Budget: ₹${Number(profile.startingBudget || 0).toLocaleString('en-IN')}, Interests: ${(profile.businessInterests || []).join(', ') || 'General'}, Skills: ${(profile.skills || []).join(', ') || 'Not specified'}. Resources: 3-phase power=${profile.resources?.hasThreePhasePower ? 'Yes' : 'No'}, land=${profile.resources?.hasLand ? 'Yes' : 'No'}, vehicle=${profile.resources?.hasVehicle ? 'Yes' : 'No'}.`;
  }

  return `You are the "RuralRise AI Entrepreneurship Assistant", an expert, pragmatic, respectful, and grounded guide for rural micro-entrepreneurs, women's self-help groups (SHGs), and youth in Warangal District, Telangana, India.

CRITICAL OPERATIONAL RULES:
1. TRUTHFULNESS & GROUNDING:
   - Ground all advice strictly in the provided verified data below.
   - NEVER fabricate market prices, demand numbers, subsidy approval guarantees, or financial profits.
   - Always distinguish verified facts from engineering assumptions and missing evidence that requires physical on-ground verification.
   - If asked about something outside Warangal or unknown, state clearly that you do not have verified field evidence.

2. GOVERNMENT SCHEMES & SUBSIDIES:
   - Reference real schemes: PMEGP (up to 35% rural subsidy), PMFME (35% ODOP capital subsidy for Chilli processing in Warangal), T-PRIDE (35% for SC/ST with power subsidy), and Mudra Shishu/Kishore (collateral-free loans up to ₹50,000 / ₹5,00,000).
   - Provide the official government portal URLs:
     * PMEGP: https://www.kviconline.gov.in/pmegpeportal
     * PMFME: https://pmfme.mofpi.gov.in
     * T-PRIDE: https://ipass.telangana.gov.in
     * Mudra: https://www.mudra.org.in
   - Warn clearly: Government portals NEVER charge application fees. Beware of unauthorized intermediaries. Subsidies are subject to formal bank appraisal and DIC verification.

3. FINANCIAL QUESTIONS:
   - Encourage users to test their exact numbers using the built-in deterministic Financial Feasibility Calculator in RuralRise AI.
   - Remind users that initial capital must include a working capital buffer (at least 2-3 months of fixed overheads) in addition to equipment costs.

4. LANGUAGE SUPPORT:
   - User selected language: ${language === 'te' ? 'Telugu (తెలుగు)' : 'English'}.
   ${language === 'te' 
     ? 'Respond completely in natural, respectful, and grammatically accurate Telugu (తెలుగు script). You may include technical terms, official portal names, or scheme acronyms (e.g. PMEGP, FSSAI) in English in parentheses where helpful.'
     : 'Respond in clear, accessible, and practical English. Use concise bullet points where appropriate.'}

5. LOCAL WARANGAL CONTEXT:
   - Mention real local Warangal infrastructure: Enumamula Agricultural Market Yard (chilli hub), District Industries Centre (DIC) at Subedari, Hanamkonda (Ph: 0870-2577626), Kothawada weavers cluster, Telangana Grameena Bank (TGGB), and Lead District Manager at SBI Subedari.

VERIFIED WARANGAL OPPORTUNITY CATALOGUE:
${opportunitiesSummary}

VERIFIED GOVERNMENT SCHEMES:
${schemesSummary}

VERIFIED WARANGAL MARKET EVIDENCE:
${evidenceSummary}

CURRENT USER CONTEXT (Authorized & Sanitized):
${userContextText}
${currentTab ? `User is currently viewing the "${currentTab}" page of the application.` : ''}
${opportunityId ? `User is asking about opportunity ID "${opportunityId}".` : ''}
`;
}

/**
 * Handles conversational multi-turn chat with RuralRise AI Assistant
 */
export async function chatWithRuralRiseAssistant(
  messages: ChatMessageInput[],
  language: Language = 'en',
  context?: {
    currentTab?: string;
    opportunityId?: string;
    profile?: Partial<UserProfile>;
  }
): Promise<AssistantChatResult> {
  const ai = getGeminiClient();

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Chat history cannot be empty.');
  }

  // Enforce reasonable message limit (last 10 turns max)
  const trimmedMessages = messages.slice(-10);

  // Validate and sanitize content
  for (const m of trimmedMessages) {
    if (!m.content || typeof m.content !== 'string' || m.content.trim().length === 0) {
      throw new Error('Message content cannot be blank.');
    }
    if (m.content.length > 2000) {
      throw new Error('Message length exceeds maximum allowed limit of 2,000 characters.');
    }
  }

  const systemInstruction = buildAssistantSystemInstruction(
    language,
    context?.profile,
    context?.currentTab,
    context?.opportunityId
  );

  // Map to SDK contents format
  const contents = trimmedMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content.trim() }]
  }));

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Assistant response timed out after 15 seconds. Please retry.')), 15000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const reply = response.text?.trim();

    if (!reply) {
      throw new Error('The assistant returned an empty response. Please retry.');
    }

    // Extract official links referenced in the reply
    const sources: Array<{ name: string; url: string }> = [];
    const sourceCandidates = [
      { name: 'MoFPI PMFME Portal', url: 'https://pmfme.mofpi.gov.in' },
      { name: 'KVIC PMEGP Portal', url: 'https://www.kviconline.gov.in/pmegpeportal' },
      { name: 'Telangana TS-iPASS Portal', url: 'https://ipass.telangana.gov.in' },
      { name: 'Pradhan Mantri Mudra Yojana', url: 'https://www.mudra.org.in' },
      { name: 'AGMARKNET Market Data', url: 'https://agmarknet.gov.in' },
      { name: 'GI Registry of India', url: 'https://ipindia.gov.in' }
    ];

    for (const cand of sourceCandidates) {
      if (reply.includes(cand.url) || reply.toLowerCase().includes(cand.name.toLowerCase())) {
        sources.push(cand);
      }
    }

    return {
      reply,
      sources,
      source: 'gemini-3.8-flash'
    };
  } catch (err: any) {
    console.error('Gemini chat assistant failed:', err);
    throw new Error(err.message || 'Assistant service is temporarily unavailable. Please verify connectivity.');
  }
}

/**
 * Transcribes spoken audio into text using gemini-3.5-transcribe
 */
export async function transcribeAudioWithAI(
  audioBase64: string,
  mimeType: string = 'audio/webm'
): Promise<{ transcript: string }> {
  const ai = getGeminiClient();

  if (!audioBase64 || typeof audioBase64 !== 'string') {
    throw new Error('Valid base64 audio data is required for transcription.');
  }

  // Clean base64 data URL prefix if present
  const cleanBase64 = audioBase64.replace(/^data:[a-zA-Z0-9\/\-]+;base64,/, '');

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Audio transcription timed out after 15 seconds. Please retry.')), 15000);
    });

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'audio/webm'
              }
            },
            {
              text: 'Transcribe the spoken audio verbatim in English or Telugu as spoken. Do NOT add any introductory text, labels, or conversational commentary. Return ONLY the transcribed text.'
            }
          ]
        }
      ]
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const transcript = response.text?.trim() || '';

    return { transcript };
  } catch (err: any) {
    console.error('Audio transcription failed:', err);
    throw new Error(err.message || 'Audio transcription service unavailable. Please speak clearly or type your question.');
  }
}
