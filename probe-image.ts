import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

async function test() {
    const result = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: 'A tiny blue square',
        config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
            outputMimeType: 'image/png'
        }
    });
    console.log(result.generatedImages[0].image.imageBytes.slice(0, 50));
}

test().catch(console.error);
