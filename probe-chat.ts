import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || "";
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
