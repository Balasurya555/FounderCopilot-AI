async function test() {
    const BACKEND_URL = "http://localhost:5000";
    const messages = [
        { role: "assistant", content: "Hi! I'm your AI Co-Founder. What startup idea are we building today?" },
        { role: "user", content: "test idea" }
    ];

    try {
        const response = await fetch(`${BACKEND_URL}/startup-insights`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
        });

        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

test();
