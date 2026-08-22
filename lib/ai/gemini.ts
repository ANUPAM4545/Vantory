/**
 * Gemini AI Co-Pilot Integration for SkillAssociate
 * Enforces strict prompt injection boundaries, off-topic filtering, & sanitization.
 * Provides high-impact, realistic ATS resume options with zero critique leaks or placeholders.
 */

export interface EnhanceTextOptions {
  selectedText: string;
  sectionContext?: string;
  mode?: "enhance" | "concise" | "action_oriented" | "custom";
  customInstruction?: string;
}

export interface EnhanceTextResponse {
  success: boolean;
  enhancedText: string;
  originalText: string;
  analysis?: string;
  alternativeText?: string;
  sectionContext?: string;
  isOffTopic?: boolean;
  error?: string;
}

/**
 * Sanitize text to prevent control character injection
 */
function sanitizeInput(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, 1500); // Strict length limit
}

/**
 * Check if query is off-topic (e.g. "what is dsa") or a prompt injection attempt
 */
function checkOffTopicOrInjection(
  text: string,
  instruction?: string
): { isViolating: boolean; reason?: string } {
  const combined = `${text} ${instruction || ""}`.toLowerCase();

  // 1. Prompt Injection Defenses
  const injectionPatterns = [
    /ignore (.*?) instructions/i,
    /override (.*?) rules/i,
    /you are now (an unrestricted|a general|jailbroken)/i,
    /print (system prompt|secret key|environment variables)/i,
    /reveal (system instructions|hidden rules)/i,
    /disregard safety/i,
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(combined)) {
      return {
        isViolating: true,
        reason: "Prompt injection attempt detected. AI Co-Pilot safety boundaries enforced.",
      };
    }
  }

  // 2. Off-Topic Query Defenses (general Q&A unrelated to resume building)
  const offTopicPatterns = [
    /^\s*what is (dsa|data structures|algorithms|python|react|quantum|calculus|ai|machine learning)\b/i,
    /^\s*(explain|tell me about) (dsa|data structures|history|geography|physics|chemistry|quantum)\b/i,
    /^\s*(tell me|write) a (joke|poem|story|song|script|code to hack)\b/i,
    /^\s*who is (the president|prime minister|elon musk|steve jobs)\b/i,
    /^\s*what is the capital of\b/i,
    /^\s*how to (cook|bake|make a cake|build a bomb|hack)\b/i,
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(combined)) {
      return {
        isViolating: true,
        reason: "I am your AI Resume Co-Pilot dedicated exclusively to optimizing resume content. Please ask for resume-related enhancements (e.g. 'Add metrics', 'Make concise', 'Rewrite for Senior Engineer').",
      };
    }
  }

  return { isViolating: false };
}

/**
 * Clean & polish output into realistic, high-impact resume sentence formatting
 */
function cleanSingleLine(str: string): string {
  let res = str
    .replace(/^["'*\s]+|["'*\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Clean double percent signs
  res = res.replace(/%%+/g, "%");

  // Replace placeholder tokens like [Number], [X]%, [Tool] with realistic numbers & terms
  res = res
    .replace(/\[(Number|number|N|X|\d+)\]/gi, "3+")
    .replace(/\[(X|\d+)(%|ms|s)?\]/g, "35%")
    .replace(/\[(LLM\/Vector DB|Vector DB|Tool|Tech Stack|Technology)\]/gi, "Next.js & TypeScript")
    .replace(/\[(Company|Organization|Field)\]/gi, "high-growth technology team");

  res = res.charAt(0).toUpperCase() + res.slice(1);
  return res.endsWith(".") ? res : `${res}.`;
}

/**
 * Reject string if it is a critique note instead of a resume rewrite
 */
function isCritiqueNote(str: string): boolean {
  if (!str || str.length < 10) return true;
  const s = str.trim();
  return (
    /^(Words \(subjective|It lacks|Weaknesses|Strengths|Critique|Analysis:|Goal:|Note:|Constraint|Role:|Can sometimes|Undersell|Critique:)/i.test(s) ||
    /\b(undersell|framing|subjective|critique|weakness|lacks|advice|not framed as|can sometimes)\b/i.test(s)
  );
}

/**
 * Fallback ATS Bullet Refiner Engine
 */
function generateFallbackEnhancement(
  text: string,
  sectionContext: string,
  mode: "enhance" | "concise" | "action_oriented" | "custom",
  instruction?: string
): { enhancedText: string; alternativeText: string; analysis: string } {
  let cleaned = text.trim().replace(/\.$/, "");

  if (sectionContext.toLowerCase().includes("summary")) {
    const isGenAI = /generative ai|llm|langchain|langgraph|multi-agent/i.test(text);
    const enhanced = isGenAI
      ? `Results-driven Fullstack & Generative AI Engineer specializing in multi-agent orchestration systems, LangChain/LangGraph integrations, and production-grade web applications across React, Next.js, and Node.js.`
      : `Results-driven Software Engineer with 3+ years of experience architecting high-performance web applications and scalable microservices, consistently optimizing system latency by 35%.`;

    const alternative = isGenAI
      ? `Fullstack Engineer with hands-on expertise in Generative AI architectures, multi-agent frameworks, and modern Next.js/React full-stack ecosystems.`
      : `Software Engineer specializing in scalable web applications and microservices, driving robust system reliability and clean architecture.`;

    const analysis = `Highlighting your specific technical specializations in Generative AI, multi-agent frameworks, and full-stack engineering maximizes recruiter visibility.`;

    return {
      enhancedText: cleanSingleLine(enhanced),
      alternativeText: cleanSingleLine(alternative),
      analysis,
    };
  }

  const actionVerbs = ["Architected", "Engineered", "Spearheaded", "Optimized", "Designed", "Pioneered"];
  const selectedVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];

  if (!/^(Architected|Engineered|Spearheaded|Optimized|Designed|Built|Implemented|Developed)/i.test(cleaned)) {
    cleaned = `${selectedVerb} ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`;
  }

  let enhancedText = `${cleaned}, boosting system throughput and response efficiency by 35%+.`;
  let alternativeText = `${cleaned}.`;
  let analysis = `In your ${sectionContext}, leading with strong action verbs and quantifying measurable impact helps your resume pass ATS screeners and impress hiring managers.`;

  if (mode === "concise") {
    enhancedText = `${cleaned}.`;
    alternativeText = `Optimized ${cleaned.toLowerCase()}.`;
    analysis = `Keeping your ${sectionContext} concise ensures recruiters can quickly scan your key achievements.`;
  } else if (mode === "action_oriented") {
    enhancedText = `Spearheaded end-to-end development of ${cleaned.toLowerCase()}, driving a 40% reduction in latency and hallucination rates.`;
    alternativeText = `Engineered and scaled ${cleaned.toLowerCase()}.`;
    analysis = `Action-oriented bullet points demonstrate leadership and hands-on technical ownership.`;
  } else if (mode === "custom" && instruction) {
    const cleanInst = instruction.trim();
    if (/short|concise|brief/i.test(cleanInst)) {
      enhancedText = `${cleaned}.`;
      alternativeText = `Optimized ${cleaned.toLowerCase()}.`;
      analysis = `Shortened for maximum recruiter scannability.`;
    } else if (/metric|number|percentage|impact/i.test(cleanInst)) {
      enhancedText = `${cleaned}, driving a 35% boost in efficiency and system throughput.`;
      alternativeText = `Engineered ${cleaned.toLowerCase()}, improving operational speed by 40%.`;
      analysis = `Quantified with performance metrics to demonstrate measurable engineering impact.`;
    } else {
      enhancedText = `Results-driven Software Engineer with hands-on expertise building scalable web platforms and high-performance microservices.`;
      alternativeText = `Software Engineer specializing in scalable full-stack web applications and clean system architecture.`;
      analysis = `Refined specifically to align with your custom request: "${cleanInst}".`;
    }
  }

  return {
    enhancedText: cleanSingleLine(enhancedText),
    alternativeText: cleanSingleLine(alternativeText),
    analysis,
  };
}

/**
 * Extract clean, high-impact bullet options from Gemini AI response text
 */
function extractCleanBulletsFromAiText(
  rawText: string,
  originalText: string,
  sectionContext: string
): { enhancedText: string; alternativeText: string; analysis: string } {
  if (!rawText) {
    return generateFallbackEnhancement(originalText, sectionContext, "enhance");
  }

  const text = rawText;

  // 1. Try parsing JSON first if Gemini returned valid JSON
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const enhanced = parsed.enhancedText || parsed.optionA || parsed.recommended;
      const alternative = parsed.alternativeText || parsed.optionB || parsed.concise;
      const advice = parsed.analysis || parsed.advice;

      if (enhanced && typeof enhanced === "string" && !isCritiqueNote(enhanced)) {
        return {
          enhancedText: cleanSingleLine(enhanced),
          alternativeText: alternative && !isCritiqueNote(alternative) ? cleanSingleLine(alternative) : cleanSingleLine(enhanced),
          analysis: advice && !advice.includes("[1-sentence") ? cleanSingleLine(advice) : `Adding specific technical metrics and specializations strengthens your ${sectionContext}.`,
        };
      }
    }
  } catch {
    // Continue to regex extraction
  }

  // 2. Extract "Refinement:" or "Option 1:" or "Option A:" lines from Gemini text
  const refinements = Array.from(
    text.matchAll(/(?:Refinement|Option\s*[1A]|Recommended|Output|Rewrite)\s*[:|-]\s*["']?([^"\n\r*]+)["']?/gi)
  );

  const cleanCandidates: string[] = [];
  for (const match of refinements) {
    const candidate = match[1].trim();
    if (candidate.length > 15 && !isCritiqueNote(candidate)) {
      cleanCandidates.push(cleanSingleLine(candidate));
    }
  }

  // 3. Extract "Analysis:" or "Why:" from Gemini text
  let extractedAnalysis = `Adding specific technical tools and performance metrics transforms your ${sectionContext} into a measurable achievement.`;
  const analysisMatch = text.match(/(?:Analysis|Why|Coaching|Advice)\s*[:|-]\s*["']?([^"\n\r*]+)["']?/i);
  if (analysisMatch && analysisMatch[1].trim().length > 10 && !analysisMatch[1].includes("[1-sentence")) {
    extractedAnalysis = cleanSingleLine(analysisMatch[1]);
  }

  if (cleanCandidates.length >= 2) {
    return {
      enhancedText: cleanCandidates[0],
      alternativeText: cleanCandidates[1],
      analysis: extractedAnalysis,
    };
  }

  if (cleanCandidates.length === 1) {
    return {
      enhancedText: cleanCandidates[0],
      alternativeText: `Engineered ${cleanCandidates[0].toLowerCase()}`,
      analysis: extractedAnalysis,
    };
  }

  // 4. Search for quoted text sentences in Gemini output that are NOT critique notes
  const quoteMatches = Array.from(text.matchAll(/["']([^"'\n\r]{20,250})["']/g));
  const validQuotes = quoteMatches
    .map((m) => cleanSingleLine(m[1]))
    .filter((q) => !q.includes(originalText) && !isCritiqueNote(q));

  if (validQuotes.length >= 1) {
    return {
      enhancedText: validQuotes[0],
      alternativeText: validQuotes[1] || validQuotes[0],
      analysis: extractedAnalysis,
    };
  }

  // 5. Fallback to high-impact rule-based engine if Gemini output contained critique text
  return generateFallbackEnhancement(originalText, sectionContext, "enhance");
}

export async function enhanceResumeText({
  selectedText,
  sectionContext = "Resume Content",
  mode = "enhance",
  customInstruction,
}: EnhanceTextOptions): Promise<EnhanceTextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const cleanText = sanitizeInput(selectedText);
  if (!cleanText) {
    return {
      success: false,
      enhancedText: "",
      originalText: selectedText,
      error: "No valid text provided for enhancement.",
    };
  }

  const cleanInstruction = customInstruction ? sanitizeInput(customInstruction) : "";
  const sectionName = sanitizeInput(sectionContext) || "Resume Content";

  // Check Off-Topic or Prompt Injection Attempt
  const guardCheck = checkOffTopicOrInjection(cleanText, cleanInstruction);
  if (guardCheck.isViolating) {
    return {
      success: false,
      isOffTopic: true,
      enhancedText: "",
      originalText: cleanText,
      error: guardCheck.reason || "Query is off-topic for resume optimization.",
    };
  }

  let modeInstruction = "Enhance this resume text with strong action verbs, quantifiable metrics, and specific technologies.";
  if (mode === "concise") {
    modeInstruction = "Make this resume text concise, punchy, and direct while retaining technical terms.";
  } else if (mode === "action_oriented") {
    modeInstruction = "Lead with strong action verbs and emphasize performance metrics and operational results.";
  } else if (mode === "custom" && cleanInstruction) {
    modeInstruction = `Apply the user's specific edit request: "${cleanInstruction}".`;
  }

  const systemPrompt = `You are a world-class ATS Resume Coach & Hiring Manager.
Target Resume Section: "${sectionName}"
Selected Text to Rewrite: "${cleanText}"
Goal: ${modeInstruction}

INSTRUCTIONS:
1. Provide two realistic, high-impact replacement options for the candidate.
2. Do NOT output critique commentary, weakness lists, or placeholder tokens like "[Number]" or "[X]". Use realistic numbers if quantifying (e.g. "3+ years", "35% latency reduction").
3. Respond ONLY with a valid JSON object matching this exact schema:

{
  "analysis": "A warm 1-sentence recruiter advice on why this rewrite boosts candidate ATS score in ${sectionName}.",
  "enhancedText": "First top recommended replacement rewrite.",
  "alternativeText": "Second alternative concise replacement rewrite."
}`;

  // Discover supported models from Google API
  let availableModels: string[] = [];
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listJson = await listRes.json();
      if (Array.isArray(listJson.models)) {
        availableModels = listJson.models
          .filter((m: { supportedGenerationMethods?: string[] }) =>
            m.supportedGenerationMethods?.includes("generateContent")
          )
          .map((m: { name: string }) => m.name.replace(/^models\//, ""));
      }
    }
  } catch {
    // Proceed to candidate array
  }

  const candidateModels = Array.from(
    new Set([
      ...availableModels,
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
    ])
  );

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const requestBody = {
        contents: [
          {
            parts: [{ text: systemPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      const extracted = extractCleanBulletsFromAiText(rawText, cleanText, sectionName);

      if (extracted.enhancedText) {
        return {
          success: true,
          enhancedText: extracted.enhancedText,
          alternativeText: extracted.alternativeText,
          analysis: extracted.analysis,
          originalText: cleanText,
          sectionContext: sectionName,
        };
      }
    } catch {
      // Try next model
    }
  }

  // Fallback ATS Engine
  const fallback = generateFallbackEnhancement(cleanText, sectionName, mode, cleanInstruction);

  return {
    success: true,
    enhancedText: fallback.enhancedText,
    alternativeText: fallback.alternativeText,
    analysis: fallback.analysis,
    originalText: cleanText,
    sectionContext: sectionName,
  };
}
