export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, feature, category } = req.body;

    if (!message || !feature || !category) {
      return res.status(400).json({ reply: "Missing input" });
    }

    // ---------- CATEGORY (FIXED) ----------
    function normalizeCategory(category) {
      return category; // STRICT LEVEL SYSTEM
    }

    const cleanCategory = normalizeCategory(category);

    // ---------- PROMPT ENGINE ----------
    function getPrompt(feature, category, content) {

      // ---------- CLASS 6–7 ----------
      if (category === "junior") {
        if (feature === "notes") {
          return `
STRICT RULE: Do not exceed Class 6-8 level.

Create simple school notes.

Include:
- Title
- Simple explanation
- Easy words only

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
STRICT RULE: Do not exceed Class 6-8 level.

Generate 5 very simple questions.

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 8 ----------
      if (category === "focus") {
        if (feature === "notes") {
          return `
STRICT RULE: Do not exceed Class 8–9 level.

Create structured notes:
- Definition
- Explanation
- Key points

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
STRICT RULE: Do not exceed Class 8–9 level.

Create simple exam questions.

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 10–12 ----------
      if (category === "exam") {
        if (feature === "notes") {
          return `
STRICT RULE: ONLY CBSE Class 10–12 NCERT level. DO NOT include NEET/JEE.

Create board-level notes:
- Definition
- Key Concepts
- Important Terms
- Process
- Revision Box

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
STRICT RULE: ONLY CBSE Class 10–12 level.

Create board exam paper:
- Basic
- Short Answer
- Long Answer
- Case Study

Topic:
${content}
`;
        }
      }

      // ---------- COLLEGE ----------
      if (category === "college") {
        if (feature === "notes") {
          return `
Create advanced college-level notes:
- Deep explanation
- Technical terms
- Mechanism

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create research-level questions:
- Conceptual
- Analytical
- Case Study

Topic:
${content}
`;
        }
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
        model: "openai/gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are a STRICT CBSE academic assistant.

RULES:
- Follow class level exactly.
- Do NOT exceed syllabus level.
- No NEET/JEE content for exam level.
- Keep answers simple and structured.
`
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
