export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST allowed" });
    }

    const { message } = req.body;

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
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

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(200).json({ reply: "HF Error: " + text });
    }

    let reply = "No response";

    if (Array.isArray(data)) {
      reply = data[0]?.generated_text || "No output";
    }

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
