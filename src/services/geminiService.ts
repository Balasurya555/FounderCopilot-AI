const BACKEND_URL = "http://localhost:5000";

export async function generateLogo(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/generate-logo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageBase64 || null;
  } catch (error) {
    console.error("Logo Generation Error:", error);
    return null;
  }
}

export async function editLogo(base64Image: string, editPrompt: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/edit-logo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image, editPrompt }),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageBase64 || null;
  } catch (error) {
    console.error("Logo Edit Error:", error);
    return null;
  }
}

export async function generateStartupInsights(messages: { role: string; content: string }[]) {
  try {
    const response = await fetch(`${BACKEND_URL}/startup-insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();

    // If the backend returns an error message like "AI service temporarily unavailable"
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Startup Insights Error:", error);
    throw new Error("AI service temporarily unavailable");
  }
}
