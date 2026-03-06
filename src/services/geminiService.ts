import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export async function generateLogo(prompt: string): Promise<string | null> {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a modern, minimalist, high-contrast startup logo icon for the company: ${prompt}. Style: tech startup, vector icon, simple geometric design, white background, no text.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Logo Generation Error:", error);
    return null;
  }
}

export async function editLogo(base64Image: string, editPrompt: string): Promise<string | null> {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: "image/png",
            },
          },
          {
            text: editPrompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Logo Edit Error:", error);
    return null;
  }
}

export const startupSchema = {
  type: Type.OBJECT,
  properties: {
    startup_name: { type: Type.STRING },
    idea_summary: { type: Type.STRING },
    problem_statement: { type: Type.STRING },
    target_customers: { type: Type.ARRAY, items: { type: Type.STRING } },
    market_size_estimate: { type: Type.STRING },
    competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
    unique_advantage: { type: Type.STRING },
    revenue_model: { type: Type.ARRAY, items: { type: Type.STRING } },
    revenue_projection: {
      type: Type.OBJECT,
      properties: {
        year1: { type: Type.STRING },
        year2: { type: Type.STRING },
        year3: { type: Type.STRING },
      },
    },
    business_model_canvas: {
      type: Type.OBJECT,
      properties: {
        key_partners: { type: Type.ARRAY, items: { type: Type.STRING } },
        key_activities: { type: Type.ARRAY, items: { type: Type.STRING } },
        value_proposition: { type: Type.ARRAY, items: { type: Type.STRING } },
        customer_relationships: { type: Type.ARRAY, items: { type: Type.STRING } },
        customer_segments: { type: Type.ARRAY, items: { type: Type.STRING } },
        key_resources: { type: Type.ARRAY, items: { type: Type.STRING } },
        channels: { type: Type.ARRAY, items: { type: Type.STRING } },
        cost_structure: { type: Type.ARRAY, items: { type: Type.STRING } },
        revenue_streams: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    pitch_deck_preview: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Array of strings representing slide content for: Problem, Solution, Market Opportunity, Product, Business Model, Go To Market",
    },
    marketing_video_idea: { type: Type.STRING },
    startup_score: { type: Type.STRING },
    chat_response: { type: Type.STRING, description: "The human-like conversational response to the founder." },
    next_question_for_founder: { type: Type.STRING },
  },
  required: [
    "startup_name",
    "idea_summary",
    "problem_statement",
    "target_customers",
    "market_size_estimate",
    "competitors",
    "unique_advantage",
    "revenue_model",
    "revenue_projection",
    "business_model_canvas",
    "pitch_deck_preview",
    "marketing_video_idea",
    "startup_score",
    "chat_response",
    "next_question_for_founder",
  ],
};

const SYSTEM_INSTRUCTION = `You are Founder Copilot, a seasoned startup founder and mentor who has built and exited multiple companies.
Your mindset is strictly "Startup Founder": lean, aggressive, MVP-focused, and obsessed with product-market fit.

Your Goal:
Guide the user through the grueling process of turning a raw idea into a viable business. Don't be "nice" - be honest, analytical, and strategic. If an idea is weak, challenge it. If it's strong, help scale it.

Your Philosophy:
1. MVP First: Forget feature bloat. What's the smallest thing we can build to prove value?
2. Iterate Fast: Build, measure, learn.
3. Distribution is Everything: A great product with no distribution is a hobby.
4. Scale or Die: We aren't building a lifestyle business; we're building a world-changing startup.

In every response:
1. Analyze the input like a VC evaluating a pitch.
2. Provide strategic advice (e.g., "This isn't a moat," "Target this segment first").
3. Ask ONE sharp, critical follow-up question that helps fill the dashboard data.
4. Update the structured insights JSON based on our evolving conversation.

Tone: Professional, direct, slightly intense, entrepreneurial, and deeply supportive of the JOURNEY (not just the idea).

Always return a JSON block at the end of your response containing structured startup insights.
The dashboard will update based on this JSON.`;

export async function generateStartupInsights(messages: { role: string; content: string }[]) {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return {};
  }

  // Convert history for Gemini
  // The SDK expects history to be model-ready roles
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: startupSchema,
    },
    history,
  });

  const response = await chat.sendMessage({
    message: lastMessage,
  });

  return JSON.parse(response.text || "{}");
}
