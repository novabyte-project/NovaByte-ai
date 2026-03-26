export default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const userInput = req.body.prompt || req.body.message || "Hello";

    try {
        // Dhyaan se dekho: Yahan hum 'v1' (Stable) use kar rahe hain
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: String(userInput) }] }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return res.status(400).json({ text: "API Error: " + data.error.message });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: aiText, reply: aiText });

    } catch (error) {
        return res.status(500).json({ text: "Server Error: " + error.message });
    }
}
