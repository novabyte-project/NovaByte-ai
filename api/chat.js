export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, feature, category } = req.body;

    if (!message || !feature || !category) {
      return res.status(400).json({ reply: "Missing input" });
    }

    // ---------- CLASS LOGIC ----------
    function getPrompt(feature, category, content) {

      // ---------- CLASS 6–7 ----------
      if (category === "6-7") {
        if (feature === "notes") {
          return `
Create simple school notes.

Rules:
- Very easy English
- Short explanation
- Paragraph format

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Generate 5 simple questions.

Rules:
- Very easy language
- Basic "What/Why" questions

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 8 ----------
      if (category === "8") {
        if (feature === "notes") {
          return `
Create structured notes.

Format:
- Title
- Definition
- Explanation
- Process
- Result
- Revision Box

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create a practice paper.

Format:
Section A: 8 Questions  
Section B: Case Study + 5 MCQs  

Make it school level.

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 9 ----------
      if (category === "9") {
        if (feature === "notes") {
          return `
Create academic notes.

Format:
- Definition
- Key Points
- Important Terms
- Process (Short)
- Result
- Revision Box

Highlight important terms.

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create a structured question paper.

Sections:
A: Basic (4)
B: Short (4)
C: Advanced (2)
D: Application (2)
E: Case Study + MCQs

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 10 ----------
      if (category === "10") {
        if (feature === "notes") {
          return `
Create full board-level notes.

Include:
- Definition
- Key Concepts
- Important Terms
- Full Process
- Chemical Equation
- Factors
- Importance
- Revision Box
- Exam Notes

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create full board exam paper.

Sections:
A: Basic
B: Concept
C: Long Answer
D: Application
E: Case Study (MCQ)

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 11 ----------
      if (category === "11") {
        if (feature === "notes") {
          return `
Create advanced concept notes.

Include:
- Definition
- Light Reaction
- Dark Reaction
- Terms (ATP, NADPH)
- Full explanation
- Revision Box

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create 25-question paper.

Include:
- Basic
- Concept
- Analytical
- Advanced
- Application
- Case Study

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 12 ----------
      if (category === "12") {
        if (feature === "notes") {
          return `
Create mastery-level notes.

Include:
- Deep explanation
- Mechanism
- Terms
- Exam focus

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create advanced board + competitive paper.

Include:
- HOTS
- Application
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
Create detailed academic notes.

Include:
- Biochemical explanation
- Mechanism
- Technical terms

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create advanced analytical paper.

Include:
- Concept
- Analytical
- Research-based
- Case study

Topic:
${content}
`;
        }
      }

      return content;
    }

    const finalPrompt = getPrompt(feature, category, message);

    // ---------- API CALL ----------
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a strict educational AI. Follow format exactly. Do not add extra text."
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
