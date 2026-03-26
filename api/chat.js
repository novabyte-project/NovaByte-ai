export default async function handler(req, res) {
    const API_KEY = process.env.GEMINI_API_KEY;
    const userInput = req.body.prompt || req.body.message || "Hello";

    try {
        // Using 'gemini-pro' with 'v1' for maximum stability
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: String(userInput) }] }]
                })
            }
        );

        const data = await response.json();

        // Handle API Errors
        if (data.error) {
            return res.status(400).json({ text: "API Error: " + data.error.message });
        }

        // Validate Response
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({ text: "AI generated an empty response. Please try again." });
        }

        const aiText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: aiText, reply: aiText });

    } catch (error) {
        return res.status(500).json({ text: "Server Connection Error: " + error.message });
    }
}
