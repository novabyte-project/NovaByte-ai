export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, feature, category } = req.body;

    if (!message || !feature || !category) {
      return res.status(400).json({ reply: "Missing input" });
    }

    // ---------- CATEGORY NORMALIZER ----------
    function normalizeCategory(category) {
      category = category.toLowerCase();

      if (category.includes("6") || category.includes("7")) return "6-7";
      if (category.includes("8")) return "8";
      if (category.includes("9")) return "9";
      if (category.includes("10")) return "10";
      if (category.includes("11")) return "11";
      if (category.includes("12")) return "12";
      if (category.includes("college")) return "college";

      return "10";
    }

    const cleanCategory = normalizeCategory(category);

    // ---------- SIMPLE PROMPT (OLD STYLE OUTPUT) ----------
    function buildPrompt(feature, category, content) {

      // 🔥 MAIN FIX: NO OVER-STRICT RULES
      if (feature === "notes") {
        return `
Explain this topic clearly for class ${category} students.

Make it simple, easy to understand, and structured.
Use headings and points.

Topic:
${content}
`;
      }

      if (feature === "questions") {
        return `
Create good practice questions for class ${category} students.

Include:
- Basic questions
- Conceptual questions
- Some application questions

Topic:
${content}
`;
      }

      return content;
    }

    const finalPrompt = buildPrompt(feature, cleanCategory, message);

    // ---------- OPENROUTER API ----------
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.4, // 🔥 more natural
        messages: [
          {
            role: "system",
            content: "You are a helpful teacher. Give clear, natural, and easy explanations. Do not over-format or over-complicate."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ]
      })
    });

    const data = await response.json();

    let reply = "AI could not generate a response";

    if (data?.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content;
    } else if (data?.error) {
      reply = "Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
