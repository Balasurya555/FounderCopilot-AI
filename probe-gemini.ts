import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
	console.error("Missing OPENAI_API_KEY or GEMINI_API_KEY. Set it in your environment to use this probe.");
	process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

console.log(Object.keys(ai.models || {}));
