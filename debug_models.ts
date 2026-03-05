import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenAI(API_KEY);

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("Available Models:");
        for (const model of models) {
            console.log(`- ${model.name} (${model.displayName})`);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
