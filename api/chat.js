export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Extract user input (Handling both 'prompt' and 'message' keys)
    const { prompt, message } = req.body;
    const userInput = prompt || message;

    // 3. Get API Key from Vercel Environment Variables
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            text: "Configuration Error: GEMINI_API_KEY is missing in Vercel Settings." 
        });
    }

    try {
        // 4. Calling the Gemini 1.5 Flash API with the 'latest' tag for better compatibility
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
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

        // 5. Catching Specific Google Errors
        if (data.error) {
            return res.status(400).json({ 
                text: "Google API Error: " + data.error.message 
            });
        }

        // 6. Check if response is valid
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({
                text: "⚠️ No response from AI. Please check your API quota."
            });
        }

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // 7. Final Success Response
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
