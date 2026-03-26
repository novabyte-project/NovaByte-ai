export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Extract user input
    const { prompt, message } = req.body;
    const userInput = prompt || message || "Hello";

    // 3. Get API Key from Vercel
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            text: "Backend Error: GEMINI_API_KEY is missing in Vercel Settings." 
        });
    }

    try {
        // 4. Using v1 (STABLE) instead of v1beta
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: String(userInput) }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // 5. Catch Google API specific errors
        if (data.error) {
            return res.status(400).json({ 
                text: "Google API Error: " + data.error.message 
            });
        }

        // 6. Check for valid AI response
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({
                text: "⚠️ AI is not responding. Check your API quota."
            });
        }

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // 7. Send back results
        return res.status(200).json({ 
            text: aiResponseText,
            reply: aiResponseText 
        });

    } catch (error) {
        return res.status(500).json({
            text: "Server Error: " + error.message
        });
    }
}
