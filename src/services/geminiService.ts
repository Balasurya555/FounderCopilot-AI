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
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            text: `Create a professional, modern, minimalist startup logo for: ${prompt}. The logo should be clean, high-contrast, and suitable for a tech company. White background. No text, just a symbol or icon.`,
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

const SYSTEM_INSTRUCTION = `You are Founder Copilot, an AI startup co-founder and mentor.
Your job is to help founders turn rough ideas into strong startup opportunities through conversation.
You must guide the user step-by-step to refine their startup idea and evaluate its potential.
Think like a startup founder, a venture capitalist, and a mentor.

Continuously:
1. Ask clarifying questions.
2. Identify core problem and target users.
3. Analyze market opportunity.
4. Identify competitors.
5. Suggest scalable business models.
6. Suggest revenue streams.
7. Evaluate potential (1-10 score).
8. Improve positioning.

Tone: supportive, analytical, strategic, entrepreneurial.
Do NOT just answer. Guide like a co-founder.

Conversation Rules:
1. Analyze the idea.
2. Ask at least one important follow-up question.
3. Improve the idea if possible.

Always return a JSON block at the end of your response containing structured startup insights.
The dashboard will update based on this JSON.`;

export async function generateStartupInsights(messages: { role: string; content: string }[]) {
  if (!ai) {
    console.warn("Gemini API key not configured");
    return {};
  }
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: startupSchema,
    },
  });

  // Convert messages to Gemini format
  const lastMessage = messages[messages.length - 1].content;

  // We use sendMessage for simplicity in this context, 
  // but for full history we would pass it to create() or send multiple messages.
  // For this app, we'll just send the current context.
  const response = await chat.sendMessage({
    message: lastMessage,
  });

  return JSON.parse(response.text || "{}");
}
