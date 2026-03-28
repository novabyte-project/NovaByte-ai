// /api/chat.js
export default async function handler(req, res) {
  const HF_TOKEN = process.env.HF_TOKEN;
  if (!HF_TOKEN) {
    return res.status(500).json({ error: "HF_TOKEN missing. Set it in Vercel Environment Variables." });
  }

  // Correct Hugging Face model URL
  const MODEL_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1";

  try {
    const response = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: req.body.prompt || "Hello" }),
    });

    // Safely parse JSON response
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("API ERROR:", err);
    res.status(500).json({ error: "Server Connection Error. Check HF_TOKEN and model URL." });
  }
}
