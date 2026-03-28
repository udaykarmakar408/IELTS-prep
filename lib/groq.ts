import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY || "";

if (!apiKey && typeof window !== "undefined") {
  console.warn("GROQ_API_KEY is missing. Groq-powered features will not work.");
}

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

export async function callGroq(prompt: string, systemInstruction?: string, model: string = "llama-3.3-70b-versatile") {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
        { role: "user" as const, content: prompt },
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(`Groq API Error (${model}):`, error);
    throw error;
  }
}

export async function callGroqJSON(prompt: string, schema?: any, systemInstruction?: string, model: string = "llama-3.3-70b-versatile") {
  try {
    const schemaPrompt = schema ? `\n\nYour response MUST strictly follow this JSON schema:\n${JSON.stringify(schema, null, 2)}` : "";
    const response = await groq.chat.completions.create({
      messages: [
        ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
        { role: "user" as const, content: `${prompt}${schemaPrompt}\n\nReturn your response in JSON format.` },
      ],
      model: model,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq JSON returned an empty response.");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`Groq JSON Error (${model}):`, error);
    throw error;
  }
}

export async function callGroqChat(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  model: string = "llama-3.3-70b-versatile"
) {
  try {
    const response = await groq.chat.completions.create({
      messages: messages,
      model: model,
      temperature: 0.7,
      stream: false,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq Chat returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(`Groq Chat Error (${model}):`, error);
    throw error;
  }
}
