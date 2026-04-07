export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, category, classLevel, feature } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    let finalPrompt = message;

    // ===============================
    // SIMPLIFIED NOTES
    // ===============================
    if (feature === "Simplified Notes") {

      // Junior Learners
      if (category === "Junior Learners" && classLevel == "6") {
        finalPrompt = `
Create very simple notes.

Topic: ${message}

Rules:
- 3–4 main points
- very simple sentences
- short easy definition
- small revision box
`;
      }

      else if (category === "Junior Learners" && classLevel == "7") {
        finalPrompt = `
Create structured notes.

Topic: ${message}

Rules:
- 4–5 bullet points
- short paragraphs
- keywords explained in brackets
- mini revision box
`;
      }

      else if (category === "Junior Learners" && classLevel == "8") {
        finalPrompt = `
Create detailed notes.

Topic: ${message}

Rules:
- 5–6 bullet points
- 1–2 line explanation
- highlight keywords
- full revision box
- include "Why It Matters"
`;
      }

      // Focused Scholars
      else if (category === "Focused Scholars" && classLevel == "9") {
        finalPrompt = `
Create concept-focused notes.

Topic: ${message}

Rules:
- 4–6 bullet points
- short paragraphs
- keywords with explanation
- small revision box
`;
      }

      else if (category === "Focused Scholars" && classLevel == "11") {
        finalPrompt = `
Create advanced notes.

Topic: ${message}

Rules:
- 5–7 bullet points
- 1–2 paragraphs
- keywords bold
- include "Why It Matters"
- include mini-examples
`;
      }

      // Exam Champions
      else if (category === "Exam Champions" && classLevel == "10") {
        finalPrompt = `
Create exam-focused notes.

Topic: ${message}

Rules:
- 6–8 key points
- 2 short paragraphs
- keywords with explanations/examples
- include "Why It Matters"
- revision box (5–7 points + exam tips)
`;
      }

      else if (category === "Exam Champions" && classLevel == "12") {
        finalPrompt = `
Create advanced exam notes.

Topic: ${message}

Rules:
- 7–10 key points
- 2–3 paragraphs
- keywords with examples
- include "Why It Matters"
- include mini-case
- revision box (5–7 points + quick exam tricks)
`;
      }

      // Advanced Thinkers
      else if (category === "Advanced Thinkers") {
        finalPrompt = `
Create college-level notes.

Topic: ${message}

Rules:
- 6–8 key points
- 2–4 paragraphs
- keywords with practical applications
- revision box (5–7 points)
- include "Why It Matters" (real-world relevance)
`;
      }
    }

    // ===============================
    // GENERATE QUESTIONS
    // ===============================
    else if (feature === "Generate Questions") {

      // Junior Learners
      if (category === "Junior Learners" && classLevel == "6") {
        finalPrompt = `
Generate questions.

Topic: ${message}

Rules:
- 2–3 basic questions
- definition based
- very easy
`;
      }

      else if (category === "Junior Learners" && classLevel == "7") {
        finalPrompt = `
Generate questions.

Topic: ${message}

Rules:
- 2 basic questions
- 2 conceptual questions
`;
      }

      else if (category === "Junior Learners" && classLevel == "8") {
        finalPrompt = `
Generate questions.

Topic: ${message}

Rules:
- 2 basic
- 2 conceptual
- 1 application question
`;
      }

      // Focused Scholars
      else if (category === "Focused Scholars" && classLevel == "9") {
        finalPrompt = `
Generate questions.

Topic: ${message}

Rules:
- 2–3 basic questions
- 2 conceptual questions
`;
      }

      else if (category === "Focused Scholars" && classLevel == "11") {
        finalPrompt = `
Generate questions.

Topic: ${message}

Rules:
- 2 basic
- 2 conceptual
- 2 application questions
`;
      }

      // Exam Champions
      else if (category === "Exam Champions" && classLevel == "10") {
        finalPrompt = `
Generate board exam questions.

Topic: ${message}

Rules:
- 3 basic questions
- 3 conceptual questions
- 2 long questions
- 1 application question
`;
      }

      else if (category === "Exam Champions" && classLevel == "12") {
        finalPrompt = `
Generate advanced exam questions.

Topic: ${message}

Rules:
- 3 basic
- 3 conceptual
- 2–3 application questions
- 2–3 long questions
`;
      }

      // Advanced Thinkers
      else if (category === "Advanced Thinkers") {
        finalPrompt = `
Generate analytical questions.

Topic: ${message}

Rules:
- 2–3 basic
- 2–3 conceptual
- 2–3 application
- 1–2 case study questions
`;
      }
    }

    // API CALL
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "user", content: finalPrompt }
        ]
      })
    });

    const data = await response.json();

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
