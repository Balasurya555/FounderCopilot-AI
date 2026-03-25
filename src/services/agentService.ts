const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export interface ToolResult {
  tool: string;
  data: any;
}

export interface AgentResponse {
  response: string;
  toolResults: ToolResult[];
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

export async function sendAgentMessage(
  messages: { role: string; content: string }[],
  askedQuestions: string[] = []
): Promise<AgentResponse> {
  try {
    const response = await fetchWithRetry(`${BACKEND_URL}/api/agent-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, askedQuestions }),
    });

    const data = await response.json();
    if (data.error && !data.response) {
      throw new Error(data.error);
    }

    return {
      response: data.response || "I've updated the dashboard with my analysis.",
      toolResults: data.toolResults || [],
    };
  } catch (error) {
    console.error("Agent Chat Error:", error);
    return {
      response: "I'm reconnecting to the AI service. Please try again in a moment.",
      toolResults: [],
    };
  }
}
