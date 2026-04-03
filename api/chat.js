export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "No message provided" });

    const endpoint = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";
    const headers = {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    };

    let reply = null;
    let attempts = 0;

    // Retry loop for model loading (permanent fix)
    while (!reply && attempts < 5) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ inputs: message }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        return res.status(200).json({ reply: "HF Error: " + text });
      }

      if (Array.isArray(data) && data[0]?.generated_text) {
        reply = data[0].generated_text;
        break;
      } else if (data?.error?.includes("Model is loading")) {
        // Model still loading, wait 2 seconds then retry
        attempts++;
        await new Promise(r => setTimeout(r, 2000));
      } else {
        reply = "No output from AI";
        break;
      }
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
