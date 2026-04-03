export default async function handler(req, res) {
  try {
    // Safety: POST request hi allow karo
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method not allowed ❌" });
    }

    // Body parse (Vercel me kabhi string hoti hai)
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const userMessage = body.message;

    // Hugging Face API call
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: userMessage
        })
      }
    );

    const data = await response.json();

    // Safe response handling
    let reply = "No response 😅";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.error) {
      reply = "Error: " + data.error;
    }

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({
      reply: "Server error ❌",
      error: error.message
    });
  }
}
