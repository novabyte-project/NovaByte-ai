export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method not allowed ❌" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const userMessage = body.message;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
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

    let reply = "No response 😅";

    if (Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data.error) {
      reply = data.error;
    }

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({
      reply: "Server error ❌",
      error: error.message
    });
  }
}
