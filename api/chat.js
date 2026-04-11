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
      if (category.includes("10") || category.includes("tenth")) return "10";
      if (category.includes("11") || category.includes("eleven")) return "11";
      if (category.includes("12") || category.includes("twelve")) return "12";
      if (category.includes("college")) return "college";

      return category;
    }

    const cleanCategory = normalizeCategory(category);

    // ---------- PROMPT ENGINE ----------
    function getPrompt(feature, category, content) {

      // ---------- CLASS 6–7 ----------
      if (category === "6-7") {
        if (feature === "notes") {
          return `
Create simple school notes.

Rules:
- Very easy language
- Short explanation
- Paragraph format only

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Generate 5 simple questions.

Rules:
- Very easy language
- Basic What/Why questions

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
Create practice paper.

Section A: Short Questions  
Section B: Case Study + MCQs  

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

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create structured question paper.

Sections:
A: Basic
B: Short
C: Advanced
D: Application
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
- Key Terms (ATP, NADPH)
- Full Explanation
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
- Deep Explanation
- Mechanism
- Important Terms
- Exam Focus Points

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create advanced board + competitive paper.

Include:
- HOTS Questions
- Application Based
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
- Biochemical Explanation
- Mechanism
- Technical Terms

Topic:
${content}
`;
        }

        if (feature === "questions") {
          return `
Create advanced analytical paper.

Include:
- Conceptual Questions
- Analytical Questions
- Research-based Questions
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
        model: "openrouter/auto",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "You are a strict academic AI. Generate structured educational content based on school/college level. Do not add extra commentary or unrelated text. Follow format exactly."
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
