export default async function handler(req, res) {
  try {
    // Allow only POST
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    // Get message
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    // OpenRouter API call
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // Extract reply safely
    let reply = "AI could not generate a response";

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      reply = data.choices[0].message.content;
    } else if (data && data.error) {
      reply = "Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
