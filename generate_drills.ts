import { callGroqJSON } from "./lib/groq";
import fs from "fs";

async function generateDrills() {
  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string" },
        type: { type: "string", enum: ["reading", "listening"] },
        title: { type: "string" },
        mins: { type: "number" },
        difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              text: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct: { type: "number" },
              explanation: { type: "string" }
            },
            required: ["id", "text", "options", "correct", "explanation"]
          }
        }
      },
      required: ["id", "type", "title", "mins", "difficulty", "questions"]
    }
  };

  const prompt = `Generate 100 unique IELTS practice drills (50 reading, 50 listening).
  Each drill should have 2-3 questions.
  The topics should be diverse (science, history, environment, technology, social issues, etc.).
  The difficulty should be mixed (Easy, Medium, Hard).
  Return ONLY a JSON array of objects matching the schema.
  Make sure the content is high quality and realistic for IELTS.`;

  try {
    const drills = await callGroqJSON(prompt, schema, "You are an IELTS content creator.");
    fs.writeFileSync("drills_data.json", JSON.stringify(drills, null, 2));
    console.log("Successfully generated 100 drills.");
  } catch (error) {
    console.error("Error generating drills:", error);
  }
}

generateDrills();
