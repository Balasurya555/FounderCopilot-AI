const { GoogleGenAI } = require("@google/genai");

async function testSVG() {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyApzkp_LpgpxZHhj6P_u6OFMW2fpr-uG9U" });
    try {
        const prompt = `You are an expert logo designer. Generate a clean, modern SVG logo for a startup named "DataSense". The user requested: "i need a red color logo". 
Return ONLY the raw, valid SVG code string and nothing else. Ensure it's responsive (using viewBox) and visually appealing. Do not wrap in markdown tags.`;

        const response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: prompt
        });

        const svgCode = response.text.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();
        console.log("SVG:", svgCode.substring(0, 100) + "...");
    } catch (error) {
        console.error("Error:", error);
    }
}
testSVG();
