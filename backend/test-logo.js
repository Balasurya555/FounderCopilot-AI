async function test() {
    try {
        const res = await fetch("http://localhost:5000/api/generate-logo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startupName: "Test", description: "i need a red color logo" })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data.error || (data.logo ? "Got logo" : data));
    } catch (e) { console.error(e); }
}
test();
