export default async function handler(req, res) {
  try {
    // Allow only POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    // Get message from request
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    // Hugging Face API endpoint (stable model)
    const endpoint = "https://api-inference.huggingface.co/models/google/flan-t5-large";

    // Send request to Hugging Face
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: message,
      }),
    });

    const data = await response.json();

    // Extract response
    let reply = "AI could not generate a response";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data?.error) {
      reply = "Error: " + data.error;
    }

    // Send response back to frontend
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error" });
  }
}
