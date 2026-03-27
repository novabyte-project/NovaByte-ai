export default async function handler(req, res) {
    const HF_TOKEN = process.env.HF_TOKEN;
    const userInput = req.body.prompt || req.body.message || "Hello";

    // NEW ROUTER URL as required by Hugging Face update
    const MODEL_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3";

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

        // Check if the model is still loading/starting up
        if (data.error && data.error.includes("currently loading")) {
            return res.status(503).json({ 
                text: "AI is warming up... please wait 10 seconds and try again.",
                error: data.error 
            });
        }

        if (data.error) {
            return res.status(400).json({ text: "API Error: " + data.error });
        }

        // Handle successful response
        const aiText = data[0].generated_text;
        
        return res.status(200).json({ 
            text: aiText, 
            reply: aiText 
        });

    } catch (error) {
        return res.status(500).json({ text: "Server Connection Error: " + error.message });
    }
}
