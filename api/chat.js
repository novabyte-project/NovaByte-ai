export default async function handler(req, res) {
    const HF_TOKEN = process.env.HF_TOKEN;
    const userInput = req.body.prompt || req.body.message || "Hello";

    // Using Mistral 7B - Extremely stable and fast
    const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3";

    try {
        const response = await fetch(MODEL_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: userInput,
                parameters: { 
                    max_new_tokens: 500, 
                    return_full_text: false 
                }
            }),
        });

        const data = await response.json();

        // If the model is loading, Hugging Face returns an 'estimated_time'
        if (data.error && data.error.includes("currently loading")) {
            return res.status(503).json({ 
                text: "Model is starting up... please wait 10 seconds and try again.",
                error: data.error 
            });
        }

        if (data.error) {
            return res.status(400).json({ text: "API Error: " + data.error });
        }

        // Response handling for Hugging Face array format
        const aiText = data[0].generated_text;
        
        // Return response in the format your frontend expects
        return res.status(200).json({ 
            text: aiText, 
            reply: aiText 
        });

    } catch (error) {
        return res.status(500).json({ text: "Server Connection Error: " + error.message });
    }
}
