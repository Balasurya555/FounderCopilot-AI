require('dotenv').config({ path: __dirname + '/.env' });

async function testREST() {
    try {
        const key = process.env.LOGO_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${key}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: "Create a modern minimalist startup logo icon for the company Test." }
                        ]
                    }
                ]
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data).substring(0, 300));
    } catch (e) {
        console.error(e);
    }
}
testREST();
