const { GoogleGenAI, Type } = require("@google/genai");

const SYSTEM_INSTRUCTION = `You are Founder Copilot.`;

const startupSchema = {
    type: Type.OBJECT,
    properties: {
        startup_name: { type: Type.STRING },
        idea_summary: { type: Type.STRING },
        design_thinking_stage: { type: Type.STRING, description: "Current stage: EMPATHIZE, DEFINE, IDEATE, PROTOTYPE, or TEST" },
        problem_statement: { type: Type.STRING },
        target_customers: { type: Type.ARRAY, items: { type: Type.STRING } },
        user_pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
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

async function test() {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyApzkp_LpgpxZHhj6P_u6OFMW2fpr-uG9U" });
    try {
        const chat = ai.chats.create({
            model: "gemini-flash-latest",
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: startupSchema,
            },
        });
        console.log("Sending request with SCHEMA (all required)...");
        const response = await chat.sendMessage({ message: "Hi! I'm starting a logistics company." });
        console.log("Response:", response.text);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
