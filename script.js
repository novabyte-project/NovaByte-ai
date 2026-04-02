export default async function handler(req, res) {
  try {
    const msg = req.body.message;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: msg })
      }
    );

    const data = await response.json();

    let reply = data[0]?.generated_text || "No response";

    res.json({ reply });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
