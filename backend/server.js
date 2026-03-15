const dotenv = require("dotenv");
const path = require("path");

// Load local .env variables.
// Priority: root .env.local -> root .env -> backend/.env
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { GoogleGenAI, Type } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

function isUsableKey(value) {
  if (!value) return false;
  const normalized = String(value).trim();
  if (!normalized) return false;

  const placeholders = new Set([
    "your_openai_key_here",
    "your_gemini_key_here",
    "YOUR_NEW_API_KEY_HERE",
    "YOUR_APP_URL_HERE",
  ]);

  return !placeholders.has(normalized);
}

function getFirstUsableKey(...candidates) {
  for (const candidate of candidates) {
    if (isUsableKey(candidate)) return String(candidate).trim();
  }
  return "";
}

// Middleware
app.use(cors());
app.use(express.json());

// Initialize AI client. Prefer OPENAI_API_KEY; fall back to GEMINI_API_KEY if present.
const API_KEY = getFirstUsableKey(process.env.OPENAI_API_KEY, process.env.GEMINI_API_KEY);
if (!API_KEY) {
  console.error("ERROR: OPENAI_API_KEY (or GEMINI_API_KEY) not found in environment variables");
  console.warn("Tip: Copy .env.example to .env.local and add OPENAI_API_KEY=your_key_here");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Ensure API key is configured and fail gracefully for AI routes
app.use((req, res, next) => {
  // Allow health and static endpoints to operate without AI
  if (req.path === "/health" || req.path === "/api/health") return next();

  if (!API_KEY) {
    console.error(`Missing OPENAI_API_KEY for request ${req.method} ${req.path}`);
    return res.status(500).json({ error: "Missing OPENAI_API_KEY. Please add it to your .env.local file." });
  }

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "backend_running" });
});

// Backward-compatible health route for clients that prefix API routes with /api.
app.get("/api/health", (req, res) => {
  res.json({ status: "backend_running" });
});

// SYSTEM INSTRUCTION FOR STARTUP COPILOT
const SYSTEM_INSTRUCTION = `You are Founder Copilot, an AI mentor that guides founders through the Design Thinking framework to build successful startups.

Your Goal:
Guide the user step-by-step through the six stages of Design Thinking: EMPATHIZE, DEFINE, IDEATE, PROTOTYPE, TEST, and LAUNCH. You must NEVER skip stages. Wait for the user to answer questions in the current stage before moving on.

The 6 Stages and Your Tasks:
1. EMPATHIZE: Understand the target audience. Ask: Who experiences this problem? What pain points do they face? What existing solutions are failing them?
2. DEFINE: Define the problem clearly. Ask the user to format their problem statement like: "[User] needs a way to [solve problem] because [reason]."
3. IDEATE: Generate solution concepts, analyze competitors, and propose a unique value proposition.
4. PROTOTYPE: Generate MVP features, wireframe ideas, and suggest branding concepts (including a logo).
5. TEST: Validate the idea. Ask: Who would be your first 10 users? How will you test this MVP? What metrics determine success?
6. LAUNCH: Prepare startup assets for publication. Tell the user they are ready to launch and can click the "Deploy to Community" button on the dashboard.

CONVERSATION FLOW RULES:
- Start with the EMPATHIZE stage for a new idea.
- Keep responses concise, instructional, and action-oriented.
- Act as a mentor, coach, and innovation guide.
- ALWAYS check the conversation history and asked questions. Never repeat a question.
- Adapt your questions based on the user's previous answers.

In every response:
1. Analyze the input like an expert design thinking coach.
2. Provide feedback.
3. Ask ONE sharp, relevant follow-up question for the current stage.
4. If a stage's goals are met, explicitly state that you are transitioning to the next stage (e.g., "Great, we've empathized with the user. Let's move to the DEFINE stage.").
5. Update the structured JSON data based on the conversation.

Return a valid JSON block at the end of your response containing the structured startup insights. The 'design_thinking_stage' field should reflect the CURRENT stage of the conversation (EMPATHIZE, DEFINE, IDEATE, PROTOTYPE, TEST, or LAUNCH).`;

const startupSchema = {
  type: Type.OBJECT,
  properties: {
    startup_name: { type: Type.STRING },
    idea_summary: { type: Type.STRING },
    design_thinking_stage: { type: Type.STRING, description: "Current stage: EMPATHIZE, DEFINE, IDEATE, PROTOTYPE, TEST, or LAUNCH" },
    problem_statement: { type: Type.STRING },
    target_customers: { type: Type.ARRAY, items: { type: Type.STRING } },
    user_pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
    existing_solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    validation_plan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps to test and validate the MVP" },
    early_adopters_strategy: { type: Type.STRING, description: "How to acquire the first 10-100 users" },
    startup_score: { type: Type.STRING },
    chat_response: { type: Type.STRING, description: "The human-like conversational response to the founder." },
    next_question_for_founder: { type: Type.STRING },
    current_category: { type: Type.STRING, description: "The category the next question belongs to: problem, customer, market, competition, revenue, growth" },
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
    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

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

    const LOGO_API_KEY = getFirstUsableKey(process.env.LOGO_API_KEY, API_KEY);
    if (!LOGO_API_KEY) {
      console.warn("LOGO_API_KEY (or GEMINI/OPENAI API key fallback) is missing or invalid.");
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
