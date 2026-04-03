export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Method not allowed" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: message,
        }),
      }
    );

    const data = await response.json();

    console.log("HF Response:", data); // 🔍 debug log

    let reply = "No response";

    if (Array.isArray(data)) {
      reply = data[0]?.generated_text || "No text generated";
    } else if (data.generated_text) {
      reply = data.generated_text;
    } else if (data.error) {
      reply = "HF Error: " + data.error;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      reply: "Server crashed ❌",
      error: err.message,
    });
  }
}
