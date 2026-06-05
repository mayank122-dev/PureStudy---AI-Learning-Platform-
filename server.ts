import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent headers for telemetry as required (lazy initialized)
let aiInstance: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance || currentApiKey !== apiKey) {
    currentApiKey = apiKey;
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Resilient wrapper for calling generateContent with exponential backoff retries for transient 503 errors
async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, retries = 3, initialDelay = 1000): Promise<any> {
  const modelsToTry = [params.model, "gemini-3.5-flash", "gemini-3.1-pro-preview"].filter((v, i, a) => a.indexOf(v) === i);
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await aiClient.models.generateContent({ ...params, model: currentModel });
      } catch (error: any) {
        lastError = error;
        const errorMessage = String(error?.message || error || "").toLowerCase();
        const errorStatus = error?.status;
        
        const isTransient = 
          errorMessage.includes("503") || 
          errorMessage.includes("unavailable") || 
          errorMessage.includes("high demand") || 
          errorMessage.includes("overloaded") ||
          errorMessage.includes("spikes in demand") ||
          errorStatus === 503 ||
          errorStatus === "UNAVAILABLE";

        const isQuotaLimit = 
          errorMessage.includes("429") || 
          errorMessage.includes("quota exceeded") ||
          errorStatus === 429 ||
          errorStatus === "RESOURCE_EXHAUSTED";

        if (isTransient && attempt < retries) {
          console.warn(`[Gemini API] Model ${currentModel} is busy (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff scaling
        } else if (isTransient || isQuotaLimit) {
           console.warn(`[Gemini API] Model ${currentModel} failed (Quota or Overloaded). Falling back to next model...`);
           break; // Break the attempt loop to try the next model
        } else {
          // If it's another non-transient error, extract user-friendly messages for common API issues
          if (errorMessage.includes("api key expired") || errorMessage.includes("api_key_invalid") || errorMessage.includes("api key not valid")) {
            throw new Error("Your Gemini API Key is expired or invalid. Please renew or update your API key in the bottom left Settings (Secrets) panel.");
          } else if (errorMessage.includes("forbidden") || errorStatus === 403 || errorStatus === "PERMISSION_DENIED") {
            throw new Error("Your Gemini API Key does not have permission. Please verify your API key in the bottom left Settings (Secrets) panel.");
          }
          throw error;
        }
      }
    }
  }

  // If all models failed, optionally format the final error
  if (lastError) {
    const finalErrorMessage = String(lastError?.message || lastError || "").toLowerCase();
    if (finalErrorMessage.includes("429") || finalErrorMessage.includes("quota exceeded")) {
      throw new Error("You have exceeded your free tier quota for the Gemini API. Please wait a bit or upgrade your API plan.");
    }
    if (finalErrorMessage.includes("api key expired") || finalErrorMessage.includes("api_key_invalid") || finalErrorMessage.includes("api key not valid")) {
      throw new Error("Your Gemini API Key is expired or invalid. Please renew or update your API key in the bottom left Settings (Secrets) panel.");
    }
  }
  throw lastError;
}

// 1. AI Doubt Solver proxy endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { question, subject, history, board, classLevel, medium } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.status(503).json({
        error: "Gemini API Key is not configured. Please add GEMINI_API_KEY in the Secrets panel."
      });
    }

    // Set target subject system guidance
    const systemInstruction = `You are a world-class educational AI tutor on "PureStudy". 
Your target audience is Indian school students.
Student Context: Educational Board - ${board || 'CBSE'}, Class Level - ${classLevel || '10'}, Medium - ${medium || 'English Medium'}.
Always automatically explain concepts according to the ${board || 'CBSE'} syllabus, ${medium || 'English Medium'} terminology, and difficulty level for Class ${classLevel || '10'} without requiring the student to explicitly mention it in their prompt.
Explain the concept of ${subject || 'the general academic subject'} clearly and step-by-step.
If it is a math problem, show steps, equations clearly, and explanations.
If science, break down concepts, terms and draw a clean textual ASCII diagram if applicable.
If grammar, outline rules and examples.
Format the output beautifully in clean Markdown with rich headers. Keep your explanations highly encouraging, easy to understand, and academic.`;

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: question }] });

    const response = await generateContentWithRetry(aiClient, {
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate AI response." });
  }
});

// 2. Notes Generator proxy endpoint
app.post("/api/generate-notes", async (req, res) => {
  try {
    const { topic, subject, language, board, classLevel, medium } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const aiClient = getAiClient();
    if (!aiClient) {
      return res.status(503).json({
        error: "Gemini API Key is not configured. Please add GEMINI_API_KEY in the Secrets panel."
      });
    }

    const targetLang = language || "English";
    const isHindi = targetLang.toLowerCase().includes("hindi");
    const langInstruction = isHindi
      ? `CRITICAL REQUIREMENT: The notes, title, summaries, definitions, concepts, key takeaways, questions and answers MUST be written in clean, grammatically correct and standard Hindi (using Devanagari script), keeping essential English technical terms in brackets next to their Hindi translation for high school academic clarity (e.g., "गुरुत्वाकर्षण (Gravity)" or "संवेग (Momentum)").`
      : `The notes, titles, and explanations must be entirely in English.`;

    const prompt = `Generate comprehensive, highly organized student revision notes on the topic: "${topic}".
Subject: ${subject || "General Science/Studies"}.
Target Board: ${board || "CBSE"}
Target Class: ${classLevel || "10"}
Target Language: ${targetLang}.
Target Medium: ${medium || "English Medium"}.
Context Requirements: The notes generated must match the ${board || "CBSE"} syllabus, ${medium || "English Medium"} terminology, and exam-oriented explanations specifically suited for Class ${classLevel || "10"}.

${langInstruction}

Your output MUST be structured as a valid JSON object with the following schema:
{
  "title": "A concise, engaging title for the revision notes in ${targetLang}",
  "topic": "${topic}",
  "subject": "${subject || "General"}",
  "language": "${targetLang}",
  "summary": "Brief 2-3 sentence overview of this topic in ${targetLang}",
  "keyConcepts": [
    {
      "name": "Concept name in ${targetLang}",
      "explanation": "Brief easy-to-understand student explanation in ${targetLang}"
    }
  ],
  "formulasOrDefinitions": [
    {
      "term": "Term or Formula name in ${targetLang}",
      "valueOrDefinition": "The actual scientific formula, mathematical equation, or literal grammatical/scientific definition in ${targetLang}"
    }
  ],
  "quickSummaries": [
    "Key takeaway point 1 in ${targetLang}",
    "Key takeaway point 2 in ${targetLang}",
    "Key takeaway point 3 in ${targetLang}"
  ],
  "practiceQuestions": [
    {
      "question": "Standard school question in ${targetLang}?",
      "answer": "Concise brief step-by-step answer or explanation in ${targetLang}"
    }
  ]
}

Ensure your response is valid JSON only. Respond with nothing else.`;

    const response = await generateContentWithRetry(aiClient, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const text = response.text || "{}";
    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (parseErr) {
      res.json({
        title: `${topic} Notes`,
        topic,
        subject,
        language: targetLang,
        summary: "Detailed notes generated.",
        keyConcepts: [{ name: "Topic Overview", explanation: text }],
        formulasOrDefinitions: [],
        quickSummaries: ["Please refer to key concepts section."],
        practiceQuestions: []
      });
    }
  } catch (error: any) {
    console.error("Notes Generator Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate notes." });
  }
});

app.post("/api/quiz/generate", express.json(), async (req, res) => {
  try {
    const aiClient = getAiClient();
    if (!aiClient) {
      return res.status(503).json({ error: "Gemini API key is not configured on the server." });
    }
    const { subject, chapter, difficulty, language, type, count = 10, board, classLevel, medium } = req.body;
    
    // Default config values
    const targetLang = (language || "English").toLowerCase();
    const quizSubj = subject || "General Knowledge";
    const quizChapter = chapter ? chapter.trim() : null;
    const quizDiff = difficulty || "Medium";
    const numQuestions = Math.min(Math.max(count, 5), 50); // between 5 and 50

    let topicInstructions = `Subject: ${quizSubj}`;
    if (quizChapter) {
      topicInstructions += `\nChapter: ${quizChapter}\nConstraint: Generate questions specifically related to the chapter/topic '${quizChapter}' within the subject '${quizSubj}'.`;
    } else {
      topicInstructions += `\nConstraint: Generate mixed questions from various chapters/topics within the subject '${quizSubj}'.`;
    }

    const prompt = `Generate a high-quality educational quiz with ${numQuestions} questions.
${topicInstructions}
Difficulty: ${quizDiff}
Language: ${targetLang}
Medium: ${medium || "English Medium"}
Board: ${board || "CBSE"}
Class Level: ${classLevel || "10"}
Quiz Type: ${type || 'Practice'}

Requirements:
- Target audience: School students in Class ${classLevel || "10"} following the ${board || "CBSE"} curriculum in ${medium || "English Medium"}.
- Ensure the chapter structure, difficulty, question terminology (${medium || "English Medium"}), and exam style perfectly match the ${board || "CBSE"} board requirements.
- Questions must be factually correct, engaging, and test real understanding, not just surface-level.
- Each question must have 4 options.
- The correct option must be randomly distributed (not always option A or B).
- Provide a detailed explanation for each answer matching the target board's concepts.

Format the output strictly as a JSON object matching this schema:
{
  "title": "A catchy title for the quiz in ${targetLang}",
  "questions": [
    {
      "text": "The question text in ${targetLang}",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": [integer 0 to 3 indicating the correct option index],
      "explanation": "Detailed explanation of why the answer is correct in ${targetLang}"
    }
  ]
}

Ensure your response is valid JSON only. Respond with nothing else.`;

    const response = await generateContentWithRetry(aiClient, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text || "{}";
    try {
      const parsedData = JSON.parse(text);
      res.json(parsedData);
    } catch (parseErr) {
      res.status(500).json({ error: "Failed to parse generated quiz structure." });
    }
  } catch (error: any) {
    console.error("Quiz Generator Error:", error);
    res.status(500).json({ error: error?.message || "Failed to generate quiz." });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Student Hub server starts running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
