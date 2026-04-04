export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const endpoint = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`, // ✅ tumhara same variable
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `<|user|>\n${message}\n<|assistant|>` // ✅ FIXED FORMAT
      }),
    });

    const data = await response.json();

    let reply = data?.[0]?.generated_text || "";

    // ✅ Clean output
    if (reply.includes("<|assistant|>")) {
      reply = reply.split("<|assistant|>")[1].trim();
    }

    if (!reply) {
      reply = "AI could not generate a response at this time";
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
