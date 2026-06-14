import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Resolve environment parameters first
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Setup ALL global parsing middlewares BEFORE any routes are declared
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

console.log("🔍 Key Check:", process.env.GEMINI_API_KEY ? "LOADED SUCCESSFULLY" : "NOT FOUND / MISSING");

// 3. Instantiate the live Google Gen AI engine client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstructionText = `
  You are DriveLegal Matrix, an advanced legal assistant specializing in Indian traffic regulations, 
  the Motor Vehicles Act, state-specific fine variants, and safety benchmarks.
  Always respond using structured markdown formatting. If the user asks for traffic rule quizzes, 
  generate realistic scenario-based questions dynamically. If they mention a specific region (like Odisha, 
  Chhattisgarh, or Haryana), tailor the penalties and fines to that state's latest compounding rules.
`;

/**
 * 🚀 Live AI Text Chat Router
 */
app.post('/api/legal-co-pilot/chat', async (req, res) => {
  try {
    // Detailed internal console logger to track what the frontend interface sends
    console.log("📥 [FRONTEND INCOMING PAYLOAD]:", JSON.stringify(req.body, null, 2));

    // Flexible text extraction based on potential frontend payload designs
    let promptText = req.body.prompt || req.body.text || req.body.message || req.body.content;
    
    // Fallback parser if your UI sends an array of conversation messages
    if (req.body.messages && Array.isArray(req.body.messages)) {
      const lastMsg = req.body.messages[req.body.messages.length - 1];
      promptText = lastMsg.content || lastMsg.text || lastMsg.message;
    }
    
    if (!promptText) {
      console.log("⚠️ Could not locate message content string inside req.body");
      return res.status(400).json({ error: "No text data detected in request body." });
    }

    console.log(`🧠 [PROCESSING WITH GEMINI]: "${promptText}"`);

    // FIX: Using correct config property block for systemInstruction under the new SDK guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction: systemInstructionText
      }
    });

    console.log("✅ [TEXT CHAT]: Response fetched successfully!");
    res.json({ reply: response.text });
  } catch (error) {
    console.error("❌ Chat Routing Error:", error);
    res.status(500).json({ error: 'Live text chat engine failure.', details: error.message });
  }
});

/**
 * 👁️ Live AI Multimodal Vision Router
 */
app.post('/api/legal-co-pilot/analyze-image', async (req, res) => {
  try {
    const { image, prompt } = req.body; 

    if (!image) {
      return res.status(400).json({ error: "No image layer base64 payload discovered." });
    }

    const defaultPrompt = "Identify the traffic signs/symbols present in this image and detail their legal implications, rules, and fines under the Motor Vehicles Act framework.";
    const userPrompt = prompt || defaultPrompt;

    console.log("📥 [VISION]: Processing image stream...");

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = image.match(/[^:]\w+\/[\w-+\.]+(?=;base64)/)?.[0] || "image/jpeg";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        userPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        systemInstruction: systemInstructionText
      }
    });

    console.log("✅ [VISION]: Image analysis completed!");
    res.json({ reply: response.text });
  } catch (error) {
    console.error("❌ Vision Routing Error:", error);
    res.status(500).json({ error: 'Live AI vision engine experienced a processing failure.', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 DriveLegal Simulation Gateway live at http://localhost:${PORT}`);
});