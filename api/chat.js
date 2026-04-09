export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ reply: "Only POST requests allowed" });

    const { className, feature, topic } = req.body;
    if (!className || !feature || !topic) return res.status(400).json({ reply: "Missing className, feature, or topic" });

    const templates = {
      "Class6": { "simplifyNotes": "3–4 points, simple sentences, short definitions, small revision box", "generateQuestions": "2–3 basic definition questions" },
      "Class7": { "simplifyNotes": "4–5 bullets, short paragraphs, keywords in brackets, mini revision box", "generateQuestions": "2 basic + 2 conceptual questions" },
      "Class8": { "simplifyNotes": "5–6 bullets, 1–2 line explanations, keywords highlighted, full revision box, Why It Matters section", "generateQuestions": "2 basic + 2 conceptual + 1 application question" },
      "Class9": { "simplifyNotes": "4–6 bullets, short core paragraph, keywords highlighted (with explanation), small revision box", "generateQuestions": "2–3 basic + 2 conceptual" },
      "Class10": { "simplifyNotes": "6–8 key points, 2 short paragraphs, bold keywords + examples, Why It Matters + revision box", "generateQuestions": "3 basic + 3 conceptual + 2 long + 1 application + 5 MCQs" },
      "Class11": { "simplifyNotes": "5–7 bullets, 1–2 paragraphs, bold keywords, Why It Matters + mini examples", "generateQuestions": "2 basic + 2 conceptual + 2 application + 5 MCQs + case study" },
      "Class12": { "simplifyNotes": "7–10 bullets, 2–3 paragraphs, bold keywords + examples, Why It Matters + revision box + quick exam tricks", "generateQuestions": "3 basic + 3 conceptual + 2–3 application + 2–3 long + 5 MCQs + case study" },
      "College": { "simplifyNotes": "6–8 bullets, 2–4 paragraphs, bold keywords + practical examples, Why It Matters, revision box 5–7 points + tips", "generateQuestions": "2–3 basic + 2–3 conceptual + 2–3 application + 1–2 case study" }
    };

    const template = templates[className]?.[feature];
    if (!template) return res.status(400).json({ reply: "Invalid className or feature" });

    const systemPrompt = `
You are STRICT educational AI. Follow FEATURES EXACTLY.
Class: ${className}
Feature: ${feature}
Template: ${template}
Topic: ${topic}
Rules:
- Follow template exactly
- Include bullets, paragraphs, revision box
- Include 'Why It Matters' for board/school/college
- Include 'Exam Tips' if applicable
- Include MCQs & Case Study for board/high classes automatically
- Do NOT skip points or add extra content
- Output must be clean, professional, ready for student use
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai/gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }], temperature: 0.1 })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content || data?.error?.message || "AI could not generate a response";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({ reply: "Server Error ❌" });
  }
}
