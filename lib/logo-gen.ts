import { GoogleGenAI } from "@google/genai";

export async function generateLogo() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: 'A modern, minimalist, high-end logo for an AI IELTS tutoring app called "Uday\'s IELTS". The logo should feature a stylized graduation cap integrated with a subtle neural network or digital pulse line. Color palette: Deep Blue (#2563eb) and Violet (#7c3aed). Clean white background, vector style, professional, sleek, flat design.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}
