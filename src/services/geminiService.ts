const BACKEND_URL = "http://localhost:5000";

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.ai === "connected";
  } catch (error) {
    return false;
  }
}

export async function sendChatMessage(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.response;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm reconnecting to the AI service. Please try again in a moment.";
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed, retrying in 1s. Remaining retries: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function generateLogo(startupName: string, startupDescription: string): Promise<string | null> {
  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/generate-logo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startupName, startupDescription }),
    });

    const data = await response.json();
    return data.imageBase64 || null;
  } catch (error) {
    console.error("Logo Generation Error:", error);
    return null;
  }
}

export async function editLogo(base64Image: string, editPrompt: string): Promise<string | null> {
  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/edit-logo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Image, editPrompt }),
    });

    const data = await response.json();
    return data.imageBase64 || null;
  } catch (error) {
    console.error("Logo Edit Error:", error);
    return null;
  }
}

export async function generateStartupInsights(messages: { role: string; content: string }[], askedQuestions: string[] = []) {
  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/startup-insights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, askedQuestions }),
    });

    const data = await response.json();

    // If the backend returns an error message like "AI service temporarily unavailable"
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error("Startup Insights Error:", error);
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
}
