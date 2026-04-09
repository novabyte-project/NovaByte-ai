export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { className, feature, topic } = req.body;

    if (!className || !feature || !topic) {
      return res.status(400).json({ reply: "Missing data" });
    }

    // Class-specific explanation
    const roleMap = {
      Class6: "Explain like teaching a young child. Use very easy words and short sentences.",
      Class7: "Explain clearly with simple language and small concepts.",
      Class8: "Explain with clarity and basic concepts with small examples.",
      Class9: "Explain concepts clearly with logic and understanding.",
      Class10: "Act like a CBSE board teacher. Give structured and exam-focused explanation.",
      Class11: "Explain deeply with conceptual clarity and small examples.",
      Class12: "Act like an expert teacher. Give advanced and exam-focused explanation.",
      College: "Explain in a professional academic style with real-world understanding."
    };

    // Feature control
    const featureMap = {
      simplifyNotes: "Explain the topic in structured and easy-to-read notes.",
      generateQuestions: "Generate different types of questions from the topic."
    };

    const prompt = `
${roleMap[className]}

Task:
${featureMap[feature]}

Topic:
${topic}

Rules:
- Keep response clean
- Use line breaks between points
- Do not mix notes and questions
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || "No response";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
