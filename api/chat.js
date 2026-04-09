export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { className, feature, topic } = req.body;
    if (!className || !feature || !topic) {
      return res.status(400).json({ reply: "Missing data" });
    }

    // 🔥 LEVEL CONTROL (MAIN FIX)
    const levelInstructions = {
      "Class6": "Use very simple English, short sentences, no tough words.",
      "Class7": "Use simple explanations, basic terms, easy understanding.",
      "Class8": "Moderate explanation with simple examples.",
      "Class9": "Balanced level, some concepts + short explanations.",
      "Class10": "Board level answers, clear concepts, proper structure, examples.",
      "Class11": "Higher level, conceptual clarity, deeper explanation.",
      "Class12": "Advanced board level, detailed, exam-focused answers.",
      "College": "Professional level, detailed with real-world examples."
    };

    // 🔥 STRICT FEATURE CONTROL
    const featureInstructions = {
      simplifyNotes: `
- ONLY simplified notes
- Give bullet points (as per class level)
- Add short explanation paragraph
- Add "Why It Matters"
- Add "Revision Box"
- DO NOT add questions
`,

      generateQuestions: `
- ONLY questions (NO notes)
- Must include:
  • Basic Questions
  • Conceptual Questions
  • Application Questions
- For Class10,11,12:
  • Add 5 MCQs (with options)
- For Class11,12:
  • Add 1 Case Study question
- DO NOT add explanations
`
    };

    // 🔥 FINAL SYSTEM PROMPT (VERY STRICT)
    const systemPrompt = `
You are a STRICT educational AI.

Class: ${className}
Feature: ${feature}

LEVEL RULE:
${levelInstructions[className]}

FEATURE RULE:
${featureInstructions[feature]}

TOPIC:
${topic}

CRITICAL RULES:
- Follow LEVEL strictly
- Follow FEATURE strictly
- DO NOT mix notes and questions
- DO NOT add extra sections
- Keep output clean and structured
`;

    // 🔥 API CALL
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0 // 🔥 VERY IMPORTANT
      })
    });

    const data = await response.json();

    let reply = data?.choices?.[0]?.message?.content || "No response";

    // 🔥 EXTRA SAFETY (ANTI-MIX FIX)
    if (feature === "simplifyNotes" && reply.toLowerCase().includes("question")) {
      reply = "⚠️ Regenerate: AI mixed questions in notes.";
    }

    if (feature === "generateQuestions" && reply.toLowerCase().includes("definition")) {
      reply = "⚠️ Regenerate: AI mixed notes in questions.";
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
