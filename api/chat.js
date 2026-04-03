export default async function handler(req, res) {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    // Call the correct Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`, // Must match Vercel env variable
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    // Read response text
    const text = await response.text();

    // Check if response is valid JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(200).json({ reply: "HF Error: " + text });
    }

    // Extract generated text
    const reply = Array.isArray(data) ? data[0]?.generated_text || "No output" : "No response";

    // Return reply to frontend
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
