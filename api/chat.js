export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, feature, category } = req.body;

    // ✅ FIX 1: allow flexible input (UI safe)
    if (!message) {
      return res.status(400).json({ reply: "Missing input" });
    }

    // ---------- CATEGORY NORMALIZER ----------
    function normalizeCategory(category = "") {
      category = category.toLowerCase();

      if (category.includes("6") || category.includes("7")) return "6-7";
      if (category.includes("8")) return "8";
      if (category.includes("9")) return "9";
      if (category.includes("10")) return "10";
      if (category.includes("11")) return "11";
      if (category.includes("12")) return "12";
      if (category.includes("college")) return "college";

      return "10"; // default safe
    }

    const cleanCategory = normalizeCategory(category);

    // ---------- LIGHT LANGUAGE CONTROL (NOT STRICT) ----------
    function getLanguageInstruction(category) {
      const levels = {
        "6-7": "Use very simple and easy words.",
        "8": "Use simple school-level language.",
        "9": "Use clear school-level explanations.",
        "10": "Use structured CBSE-style explanation.",
        "11": "Use clear conceptual explanation.",
        "12": "Use advanced but understandable explanation.",
        "college": "Use professional but clear explanation."
      };
      return levels[category] || levels["10"];
    }

    // ---------- PROMPT ENGINE (FIXED: NO OVER-RESTRICTION) ----------
    function getPrompt(feature, category, content) {
      const languageRule = getLanguageInstruction(category);

      // ✅ DEFAULT behavior (important fix)
      if (!feature) {
        return `
${languageRule}

Explain this topic clearly in a simple and structured way.

Topic:
${content}
`;
      }

      // ---------- NOTES ----------
      if (feature === "notes") {
        return `
${languageRule}

Create clear and easy-to-understand notes.

Include:
- Heading
- Key points
- Short explanation
- Revision summary

Topic:
${content}
`;
      }

      // ---------- QUESTIONS ----------
      if (feature === "questions") {
        return `
${languageRule}

Generate good practice questions.

Include:
- Basic questions
- Conceptual questions
- Application questions

Topic:
${content}
`;
      }

      return content;
    }

    const finalPrompt = getPrompt(feature, cleanCategory, message);

    // ---------- OPENROUTER API ----------
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // ✅ FIX 2: stable model
        temperature: 0.4, // ✅ FIX 3: natural output
        messages: [
          {
            role: "system",
            content: "You are a helpful teacher. Give clear, natural, and student-friendly explanations. Do not over-restrict or over-format."
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
