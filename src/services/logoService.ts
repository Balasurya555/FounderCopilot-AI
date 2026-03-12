const BACKEND_URL = "http://localhost:5000";

export async function generateLogo(startupName: string, description: string, shape: string, style: string, theme: string): Promise<string[] | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/generate-logo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ startupName, description, shape, style, theme }),
        });

        if (!response.ok) {
            throw new Error(`Failed to generate logo: ${response.statusText}`);
        }

        const data = await response.json();
        return data.logos || null;
    } catch (error) {
        console.error("Logo Generation Error in Service:", error);
        return null;
    }
}
