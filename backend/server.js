const dotenv = require("dotenv");
const path = require("path");

// Load local .env variables from the backend folder
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { GoogleGenAI, Type } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini Client
const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
  console.error("Gemini API key not found in environment variables");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Ensure API key is configured
app.use((req, res, next) => {
  const healthPaths = ["/health", "/api/health"];
  if (!ai && !healthPaths.includes(req.path)) {
    return res.status(503).json({ error: "AI service temporarily unavailable - Missing API Key" });
  }
  next();
});

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({ status: "backend_running" });
});

app.get("/api/health", (req, res) => {
  if (ai) {
    res.json({ status: "ok", ai: "connected" });
  } else {
    res.status(200).json({
      status: "ok",
      ai: "unavailable",
      error: "GEMINI_API_KEY is missing. Add it to backend/.env and restart the server."
    });
  }
});

// SYSTEM INSTRUCTION FOR DREAM2REALITY AI
const SYSTEM_INSTRUCTION = `You are Dream2Reality AI, an adaptive AI innovation mentor that guides users through Design Thinking to transform dreams and problems into real solutions.

Your personality: Encouraging, sharp, perceptive — like a startup coach who skips the fluff and asks the most important next question.

== DESIGN THINKING STAGES ==
You work through 7 stages in order:
1. EMPATHIZE  – Understand who is affected and what they need
2. DEFINE     – Craft a sharp, clear problem statement
3. IDEATE     – Generate creative solution concepts
4. VALIDATE   – Stress-test the idea against market reality
5. PROTOTYPE  – Define MVP features, product structure, and concept
6. BRANDING   – Name the startup, define identity, suggest logo concept
7. LAUNCH     – Prepare pitch deck, go-to-market strategy, community deployment

== CRITICAL: DYNAMIC STAGE DETECTION ==
At the START of every conversation, read the user's first message carefully and determine which stages are ALREADY SATISFIED based on what they've shared:

- Greeting only ("hi", "hello", "hey") → Start at EMPATHIZE. Ask: what problem or dream brought them here?
- Problem described ("students waste food", "nurses can't track patients easily") → EMPATHIZE is done. Move to DEFINE. Help sharpen the problem statement.
- Idea or solution shared ("I want to build an app that…", "what if there was a platform for…") → EMPATHIZE + DEFINE are done. Move to VALIDATE. Challenge the idea with market reality.
- Prototype or product concept shared ("I built a…", "my MVP does X, Y, Z") → Move directly to BRANDING or LAUNCH.
- Any mention of naming, logos, branding → jump to BRANDING stage.

NEVER force the user back to an earlier stage they have clearly already passed.
NEVER ask for information the user already provided in their message.
ALWAYS acknowledge what they've already figured out before asking the next question.

== CONVERSATION RULES ==
- Ask ONE sharp, targeted question per response — the most important question for the current stage.
- Be brief and mentor-like. No lecture. No lists of questions. Just one great question.
- When a stage is complete, explicitly say so and announce the transition: e.g. "Your problem statement is clear. Let's move to IDEATE."
- Update the JSON state fully with every piece of information the user provides.
- NEVER repeat a question already asked in this conversation.
- NEVER mention logo generation until the BRANDING stage.
- NEVER ask about logos, branding, or naming until BRANDING is the current stage.

== STAGE-BY-STAGE GUIDE ==
EMPATHIZE: Ask who is affected and what pain they experience. What current solutions fail them?
DEFINE: Help craft problem statement: "[User] needs a way to [solve X] because [reason]."
IDEATE: Propose 2-3 creative solution directions. Ask which resonates most.
VALIDATE: Challenge assumptions. Ask: Who are the first 10 users? Why would they pay? Who are competitors?
PROTOTYPE: Define the core MVP features. What does v1 do and not do?
BRANDING: Help name the product. Describe a logo concept. Ask if they want to generate or upload a logo.
LAUNCH: Summarize the pitch. Tell the user to click "Deploy to Community" on the dashboard.

== DYNAMIC EXAMPLE BEHAVIOR ==
User: "I want to build an AI tool for farmers"
Your response: "Great — you already have a direction. Since you've got an idea, let's validate it. Which farmers benefit most from this — small-scale, large commercial, or a specific crop type?"

User: "Students waste a lot of food in hostels"
Your response: "Strong observation. Let's define this clearly. Why does the waste happen — is it over-ordering, poor tracking, or lack of visibility for hostel managers?"

User: "I built a prototype for a hostel food tracking app"
Your response: "Solid progress. Since you already have a prototype concept, let's move to branding. What name are you considering for this product?"

The design_thinking_stage in your JSON must reflect the CURRENT stage you are operating in, which may skip ahead based on the user's input.`;

const startupSchema = {
  type: Type.OBJECT,
  properties: {
    startup_name: { type: Type.STRING },
    idea_summary: { type: Type.STRING },
    design_thinking_stage: {
      type: Type.STRING,
      description: "Current active stage: EMPATHIZE, DEFINE, IDEATE, VALIDATE, PROTOTYPE, BRANDING, or LAUNCH"
    },
    // Core state fields updated dynamically each turn
    problem_statement: { type: Type.STRING },
    target_customers: { type: Type.ARRAY, items: { type: Type.STRING } },
    target_users: { type: Type.STRING, description: "A concise description of who the primary user is" },
    user_pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    solution_idea: { type: Type.STRING, description: "The core solution concept the user is exploring" },
    existing_solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
    market_size_estimate: { type: Type.STRING },
    competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
    unique_advantage: { type: Type.STRING },
    validation_data: {
      type: Type.OBJECT,
      properties: {
        assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        risks: { type: Type.ARRAY, items: { type: Type.STRING } },
        early_adopters: { type: Type.STRING },
      }
    },
    prototype_description: { type: Type.STRING, description: "Description of the MVP or prototype concept" },
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
      description: "Slide content for: Problem, Solution, Market, Product, Business Model, Go To Market",
    },
    marketing_video_idea: { type: Type.STRING },
    validation_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
    early_adopters_strategy: { type: Type.STRING },
    startup_score: { type: Type.STRING },
    chat_response: { type: Type.STRING, description: "The adaptive, mentor-like conversational response." },
    next_question_for_founder: { type: Type.STRING },
    current_category: { type: Type.STRING },
  },
  required: [
    "startup_name",
    "idea_summary",
    "design_thinking_stage",
    "problem_statement",
    "target_customers",
    "user_pain_points",
    "existing_solutions",
    "market_size_estimate",
    "competitors",
    "unique_advantage",
    "revenue_model",
    "revenue_projection",
    "business_model_canvas",
    "pitch_deck_preview",
    "marketing_video_idea",
    "validation_plan",
    "early_adopters_strategy",
    "startup_score",
    "chat_response",
    "next_question_for_founder",
    "current_category"
  ],
};

// ----------------------------------------------------
// 1. POST /chat  (and /api/chat alias)
// Endpoint to handle chatbot conversation logic
// ----------------------------------------------------
async function handleChat(req, res) {
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
      model: "gemini-flash-latest",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      },
      history,
    });

    console.log("Gemini API request received (chat)");
    const response = await chat.sendMessage({
      message: lastMessage,
    });
    console.log("Gemini API response returned (chat)");

    res.json({ response: response.text });
  } catch (error) {
    console.error("Chat API Error:", error.message, error);
    res.status(500).json({
      error: "AI service temporarily unavailable",
      fallback: "I'm reconnecting to the AI service. Please try again in a moment."
    });
  }
}

app.post("/chat", handleChat);
app.post("/api/chat", handleChat);

// ----------------------------------------------------
// Helper for similarity checking
// ----------------------------------------------------
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Simple intersection-over-union for bigrams
  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);

  if (bg1.size === 0 || bg2.size === 0) return 0.0;

  let intersection = 0;
  for (const bg of bg1) {
    if (bg2.has(bg)) intersection++;
  }

  const union = bg1.size + bg2.size - intersection;
  return intersection / union;
}

// ----------------------------------------------------
// 2. POST /startup-insights

// Returns structured startup insights parsed as JSON
// ----------------------------------------------------
app.post("/startup-insights", async (req, res) => {
  try {
    const { messages, askedQuestions = [] } = req.body;
    if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages array format" });

    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    // Inject askedQuestions into the prompt to provide immediate context
    let lastMessage = messages[messages.length - 1].content;
    if (askedQuestions && askedQuestions.length > 0) {
      lastMessage += `\n\n[SYSTEM NOTE: Do not ask any of these questions again:\n${askedQuestions.map(q => `- ${q}`).join('\n')}]`;
    }

    const chat = ai.chats.create({
      model: "gemini-flash-latest",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: startupSchema,
      },
      history,
    });

    console.log("Gemini API request received (startup-insights)");

    let insightsData = null;
    let validQuestionFound = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (!validQuestionFound && attempts < MAX_ATTEMPTS) {
      attempts++;
      const response = await chat.sendMessage({
        message: lastMessage,
      });

      insightsData = JSON.parse(response.text || "{}");
      const generatedQuestion = insightsData.next_question_for_founder;

      let isDuplicate = false;
      if (generatedQuestion && askedQuestions.length > 0) {
        for (const asked of askedQuestions) {
          const similarity = calculateSimilarity(generatedQuestion, asked);
          if (similarity > 0.8) {
            isDuplicate = true;
            console.log(`[Attempt ${attempts}] Duplicate question detected (Similarity: ${similarity.toFixed(2)}): "${generatedQuestion}" matches "${asked}"`);
            break;
          }
        }
      }

      if (!isDuplicate) {
        validQuestionFound = true;
        console.log(`[Attempt ${attempts}] Unique question successfully generated.`);
      } else if (attempts < MAX_ATTEMPTS) {
        // If duplicate, append a strong instruction to try again
        lastMessage = `Your previous question "${generatedQuestion}" was too similar to one already asked. Analyze the data and ask a COMPLETELY DIFFERENT question advancing to the next logical stage.`;
      }
    }

    // Fallback behavior if a unique question couldn't be generated after MAX_ATTEMPTS
    if (!validQuestionFound && insightsData) {
      console.log("Fallback triggered: Could not generate a unique question.");
      insightsData.next_question_for_founder = "Based on what you've shared, let's analyze your market opportunity.";
    }

    console.log("Gemini API response returned (startup-insights)");

    res.json(insightsData);
  } catch (error) {
    console.error("Startup Insights Error:", error.message, error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// ----------------------------------------------------
// 3. POST /generate-logo
// Generates image from text directly calling gemini-flash models for SVG
// ----------------------------------------------------
app.post("/generate-logo", async (req, res) => {
  try {
    const { startupName, startupDescription } = req.body;
    if (!startupName) return res.status(400).json({ error: "startupName is required" });

    console.log("Gemini API request received (generate-logo)");
    const prompt = `You are an expert logo designer. Generate a clean, modern SVG logo for a startup named "${startupName}". Description: ${startupDescription || 'minimalist tech startup'}. Return ONLY the raw, valid SVG code string and nothing else. Ensure it's responsive (using viewBox) and visually appealing. Do not wrap in markdown tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt
    });
    console.log("Gemini API response returned (generate-logo)");

    const svgCode = response.text?.replace(/```xml/g, '')?.replace(/```svg/g, '')?.replace(/```/g, '')?.trim();
    if (svgCode && svgCode.startsWith('<svg')) {
      const base64Svg = Buffer.from(svgCode).toString('base64');
      res.json({ imageBase64: `data:image/svg+xml;base64,${base64Svg}` });
    } else {
      res.status(500).json({ error: "No valid SVG generated" });
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

    console.log("Gemini API request received (edit-logo)");

    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = "image/png";
    let b64Data = base64Image;
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      b64Data = matches[2];
    } else if (base64Image.includes(',')) {
      b64Data = base64Image.split(',')[1];
    }

    const payloadText = `You are an expert logo designer. I have attached my current logo. Please regenerate it as a clean, modern SVG logo based on this new request: "${editPrompt}". Return ONLY the raw, valid SVG code string and nothing else. Ensure it's responsive (using viewBox) and visually appealing. Do not wrap in markdown tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { inlineData: { data: b64Data, mimeType: mimeType } },
        payloadText
      ]
    });
    console.log("Gemini API response returned (edit-logo)");

    const svgCode = response.text?.replace(/```xml/g, '')?.replace(/```svg/g, '')?.replace(/```/g, '')?.trim();
    if (svgCode && svgCode.startsWith('<svg')) {
      const base64Svg = Buffer.from(svgCode).toString('base64');
      res.json({ imageBase64: `data:image/svg+xml;base64,${base64Svg}` });
    } else {
      res.status(500).json({ error: "No valid SVG returned" });
    }
  } catch (error) {
    console.error("Logo Edit Error:", error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// ----------------------------------------------------
// 4. POST /api/generate-logo
// Generates image using a separate Image Generation API
// ----------------------------------------------------
app.post("/api/generate-logo", async (req, res) => {
  try {
    const { startupName, description, shape, style, theme } = req.body;
    if (!startupName) return res.status(400).json({ error: "startupName is required" });

    const LOGO_API_KEY = process.env.LOGO_API_KEY;
    if (!LOGO_API_KEY || LOGO_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
      console.warn("LOGO_API_KEY is missing or invalid. Please configure it in .env");
      return res.status(500).json({ error: "Logo Generation API key not configured." });
    }

    console.log("Separate Image Service API request received (generate-logo)");

    const prompt = `Create a professional startup logo icon.
Startup concept: ${description || 'tech startup'}
Logo shape: ${shape || 'Minimal'}
Style: ${style || 'Modern SaaS'}
Theme: ${theme || 'Tech'}

Rules:
Icon only
No text
No typography
No letters
No background graphics
White background
Centered design

Design style:
Minimal
Flat vector
Modern tech brand
Geometric symbol

The logo must be clean, simple, and usable as a real SaaS company logo, similar to Stripe, Notion, Vercel, Linear, Airbnb.`;

    const logoAi = new GoogleGenAI({ apiKey: LOGO_API_KEY });
    const response = await logoAi.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 3,
        aspectRatio: '1:1',
        outputMimeType: 'image/jpeg'
      }
    });

    const logos = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    if (logos.length > 0) {
      res.json({ logos: logos });
    } else {
      res.status(500).json({ error: "No images returned" });
    }
  } catch (error) {
    console.error("Logo Generation Error:", error);
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// ----------------------------------------------------
// COMMUNITY IN-MEMORY DATABASE & ROUTES
// ----------------------------------------------------
let communityUsers = [
  { id: 1, name: "Sarah Chen", startupIdea: "AI-powered legal document review", skills: ["AI/ML", "Python", "Law"], location: "San Francisco", lookingFor: "Developer", bio: "Former corporate lawyer turning tech founder." },
  { id: 2, name: "Marcus Johnson", startupIdea: "Sustainable supply chain tracking", skills: ["Logistics", "Operations", "Sales"], location: "New York", lookingFor: "Technical Co-founder", bio: "10 years in global logistics. Ready to build something new." },
  { id: 3, name: "Elena Rodriguez", startupIdea: "Fintech for gig workers", skills: ["React", "Node.js", "UX Design"], location: "Remote", lookingFor: "Marketer", bio: "Full-stack dev passionate about financial inclusion." }
];

let communityTeams = [
  { id: 1, teamName: "LegalMind AI", startupIdea: "Automated contract analysis for small firms", rolesNeeded: ["Full Stack Developer", "Sales Lead"], description: "We have an MVP and initial traction. Need help scaling the platform." },
  { id: 2, teamName: "EcoTrack", startupIdea: "Carbon footprint tracking API for e-commerce", rolesNeeded: ["Data Scientist", "Marketing Manager"], description: "Looking for passionate individuals to help us build the core recommendation engine." }
];

let communityPosts = [
  { id: 1, title: "Validating a new pricing strategy for B2B SaaS", description: "Has anyone tried value-based pricing for early-stage enterprise tools? Would love some feedback on how to approach initial pilot customers.", tags: ["SaaS", "Pricing", "B2B"], author: "Marcus Johnson", likes: 12, comments: 4 },
  { id: 2, title: "Looking for feedback on AI agent architecture", description: "I'm building a multi-agent system for customer support. Torn between LangChain and rolling my own orchestration. Thoughts?", tags: ["AI", "Architecture", "Engineering"], author: "Sarah Chen", likes: 24, comments: 8 }
];

let communityConnections = [];

// GET /community/users
app.get("/community/users", (req, res) => {
  res.json(communityUsers);
});

// GET /community/teams
app.get("/community/teams", (req, res) => {
  res.json(communityTeams);
});

// GET /community/posts
app.get("/community/posts", (req, res) => {
  res.json(communityPosts);
});

// POST /community/connect
app.post("/community/connect", (req, res) => {
  const { targetUserId } = req.body;
  if (!targetUserId) return res.status(400).json({ error: "targetUserId is required" });

  // Simple mock connection logic
  const connection = { userId: "current_user", targetUserId, status: "pending", timestamp: new Date().toISOString() };
  communityConnections.push(connection);

  res.json({ success: true, connection });
});

// POST /community/post
app.post("/community/post", (req, res) => {
  const { title, description, tags, author } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Title and description are required" });

  const newPost = {
    id: communityPosts.length + 1,
    title,
    description,
    tags: tags || [],
    author: author || "Alex Rivera", // Mocking current user
    likes: 0,
    comments: 0
  };

  communityPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

app.listen(PORT, () => {
  console.log("Server started");
  console.log(`✅ Backend Proxy Server listening on http://localhost:${PORT}`);
});
