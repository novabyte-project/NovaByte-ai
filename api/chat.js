// /api/chat.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", // Replace with your model
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`, // Set HF key in Vercel
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    const data = await response.json();

    // Extract the AI reply
    const reply = data[0]?.generated_text || "AI response is empty, please try again";

    // Send response back to client
    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
}
