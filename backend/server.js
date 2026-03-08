const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI, Type } = require("@google/genai");

// Load local .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const API_KEY = process.env.GEMINI_API_KEY || "";
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Ensure API key is configured
app.use((req, res, next) => {
  if (!ai) {
    return res.status(503).json({ error: "AI service temporarily unavailable - Missing API Key" });
  }
  next();
});

// SYSTEM INSTRUCTION FOR STARTUP COPILOT
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

const startupSchema = {
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

// ----------------------------------------------------
// 1. POST /chat
// Endpoint to handle chatbot conversation logic
// Since our frontend merges standard conversation inside generateStartupInsights, 
// this is largely handled there, but we implement basic chat if needed standalone
// ----------------------------------------------------
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages array format" });

    // Format History
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const lastMessage = messages[messages.length - 1].content;

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      },
      history,
    });

    const response = await chat.sendMessage({
      message: lastMessage,
    });

    res.json({ response: response.text });
  } catch (error) {
    console.error("Chat API Error:", error.message, error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// ----------------------------------------------------
// 2. POST /startup-insights
// Returns structured startup insights parsed as JSON
// ----------------------------------------------------
app.post("/startup-insights", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages array format" });

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

    const insightsData = JSON.parse(response.text || "{}");
    res.json(insightsData);
  } catch (error) {
    console.error("Startup Insights Error:", error.message, error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// ----------------------------------------------------
// 3. POST /generate-logo
// Generates image from text directly calling imagen-3.0 models
// ----------------------------------------------------
app.post("/generate-logo", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: `Create a modern, minimalist, high-contrast startup logo icon for the company: ${prompt}. Style: tech startup, vector icon, simple geometric design, white background, no text.`,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/png'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      res.json({ imageBase64: `data:image/png;base64,${imageBytes}` });
    } else {
      res.status(500).json({ error: "No image bytes returned" });
    }
  } catch (error) {
    console.error("Logo Generation Error:", error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

app.post("/edit-logo", async (req, res) => {
  try {
    const { base64Image, editPrompt } = req.body;
    if (!base64Image || !editPrompt) return res.status(400).json({ error: "Both base64Image and editPrompt are required" });

    const response = await ai.models.editImage({
      model: 'imagen-3.0-generate-001',
      prompt: editPrompt,
      referenceImages: [{
        imageBytes: base64Image.split(',')[1],
        mimeType: "image/png"
      }],
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png'
      }
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageBytes) {
      res.json({ imageBase64: `data:image/png;base64,${imageBytes}` });
    } else {
      res.status(500).json({ error: "No image bytes returned" });
    }
  } catch (error) {
    console.error("Logo Edit Error:", error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend Proxy Server listening on http://localhost:${PORT}`);
});
