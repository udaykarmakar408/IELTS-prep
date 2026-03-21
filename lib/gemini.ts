import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY as string });

export async function callGemini(prompt: string, systemInstruction?: string, model: string = "gemini-3-flash-preview") {
  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 2048,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    return response.text;
  } catch (error) {
    console.error(`Gemini API Error (${model}):`, error);
    throw error;
  }
}

export async function callGeminiChat(history: { role: "user" | "model"; parts: { text: string }[] }[], systemInstruction?: string, model: string = "gemini-3-flash-preview") {
  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: history,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
    
    if (!response.text) {
      throw new Error("Gemini Chat returned an empty response.");
    }

    return response.text;
  } catch (error) {
    console.error(`Gemini Chat Error (${model}):`, error);
    throw error;
  }
}
