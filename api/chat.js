export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Extracting user input from request body
    const { prompt, message } = req.body;
    const userInput = prompt || message;

    // Accessing the Environment Variable from Vercel
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ 
            text: "Backend Error: GEMINI_API_KEY is not defined in Vercel Environment Variables." 
        });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: userInput }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        // Handle Google API specific errors (Quota, Invalid Key, etc.)
        if (data.error) {
            return res.status(400).json({ 
                text: "Google API Error: " + data.error.message 
            });
        }

        // Check if response contains valid content
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json({
                text: "⚠️ No response from AI. Please check your API quota or model settings."
            });
        }

        const aiResponseText = data.candidates[0].content.parts[0].text;

        // Sending back both 'text' and 'reply' keys to ensure frontend compatibility
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
