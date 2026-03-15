import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
    console.error("Missing OPENAI_API_KEY or GEMINI_API_KEY. Set it in your environment to use this probe.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function test() {
    const history = [
        { role: "model", parts: [{ text: "Hi! I'm your AI Co-Founder. What startup idea are we building today?" }] },
    ];
    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: "test instruction",
            },
            history,
        });
        const response = await chat.sendMessage({
            message: "hi",
        });
        console.log(response.text);
    } catch (err) {
        console.error("error", err);
    }
}
test();
