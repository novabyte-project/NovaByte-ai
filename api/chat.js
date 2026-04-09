export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { className, feature, topic } = req.body;

    if (!className || !feature || !topic) {
      return res.status(400).json({ reply: "Missing data" });
    }

    // ✅ LEVEL CONTROL (STRONG)
    const levelMap = {
      "Class6": "very easy, simple words, short lines",
      "Class7": "easy explanation, simple language",
      "Class8": "moderate explanation with examples",
      "Class9": "balanced explanation, some concepts",
      "Class10": "board level, structured, clear concepts",
      "Class11": "conceptual, deeper explanation",
      "Class12": "advanced, exam-focused answers",
      "College": "professional, detailed explanation"
    };

    // ✅ FEATURE CONTROL (STRICT)
    const featureMap = {
      simplifyNotes: `
Return ONLY simplified notes.
- Use bullet points
- Add small paragraph
- Add "Why It Matters"
- Add "Revision Box"
- DO NOT include questions
`,
      generateQuestions: `
Return ONLY questions.

Structure:
- Basic Questions (3)
- Conceptual Questions (3)
- Application Questions (2)

If Class10 or above:
- Add 5 MCQs

If Class11 or above:
- Add 1 Case Study

DO NOT include notes or explanations
`
    };

    // ✅ FINAL PROMPT (FIXED)
    const systemPrompt = `
You are a strict educational assistant.

Class Level: ${className}
Level Rule: ${levelMap[className]}

Feature: ${feature}
Instructions:
${featureMap[feature]}

Topic:
${topic}

Rules:
- Follow structure strictly
- Do not mix sections
- Keep output clean
`;

    // ✅ FIXED API CALL (IMPORTANT)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: topic }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();

    let reply =
      data?.choices?.[0]?.message?.content ||
      data?.error?.message ||
      "AI response failed";

    // ✅ SAFETY CLEAN (minor fix)
    if (feature === "simplifyNotes" && reply.toLowerCase().includes("question")) {
      reply = reply.replace(/question/gi, "");
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
