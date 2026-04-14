export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ reply: "Only POST requests allowed" });
    }

    const { message, feature, category } = req.body;

    if (!message || !feature || !category) {
      return res.status(400).json({ reply: "Missing input" });
    }

    // ---------- CATEGORY NORMALIZER (FIXED FOR CLASS 6/8) ----------
    function normalizeCategory(category) {
      category = category.toLowerCase();

      if (category.includes("6")) return "6";      // ← CLASS 6 ONLY
      if (category.includes("7")) return "7";
      if (category.includes("8")) return "8";      // ← CLASS 8 ONLY
      if (category.includes("9")) return "9";
      if (category.includes("10") || category.includes("tenth")) return "10";
      if (category.includes("11") || category.includes("eleven")) return "11";
      if (category.includes("12") || category.includes("twelve")) return "12";
      if (category.includes("college")) return "college";

      return category;
    }

    const cleanCategory = normalizeCategory(category);

    // ---------- LANGUAGE LEVEL CONTROLLER ----------
    function getLanguageInstruction(category) {
      const levels = {
        "6": "Use Class 6 language ONLY. VERY SIMPLE words. Short sentences. Like explaining to 11-year-old kid. NO big words!",
        "7": "Use Class 7 language ONLY. VERY SIMPLE words. Short sentences. Like explaining to 12-year-old kid. NO big words!",
        "8": "Use Class 8 language ONLY. Simple school words. Easy examples. NO Class 10 words!",
        "9": "Use Class 9 language ONLY. School level words. Clear examples. NO board exam complexity!",
        "10": "Use Class 10 CBSE language ONLY. Board exam words OK. NO Class 11/12 complexity!",
        "11": "Use Class 11 language ONLY. Intermediate level. NO college terms!",
        "12": "Use Class 12 CBSE language ONLY. Board level. NO college/engineering terms!",
        "college": "College undergraduate level OK. Technical terms allowed."
      };
      return levels[category] || "Use simple Class 10 language";
    }

    // ---------- PROMPT ENGINE ----------
    function getPrompt(feature, category, content) {
      const languageRule = getLanguageInstruction(category);

      // ---------- CLASS 6 (5 QUESTIONS ONLY) ----------
      if (category === "6") {
        if (feature === "notes") {
          return `
${languageRule}

Create simple school notes for Class 6.

Rules:
- Very easy language
- Short explanation  
- Paragraph format only

Topic:
${content}

IMPORTANT: Use ONLY Class 6 level words and sentences!
`;
        }

        if (feature === "questions") {
          return `
${languageRule}

**CLASS 6: Generate EXACTLY 5 simple questions ONLY.**

Rules:
- VERY easy language
- Basic What/Why questions  
- Class 6 level only
- **5 QUESTIONS MAXIMUM**

Topic:
${content}

**Output ONLY 5 questions. No more.**
`;
        }
      }

      // ---------- CLASS 7 ----------
      if (category === "7") {
        if (feature === "notes") {
          return `
${languageRule}

Create simple school notes for Class 7.

Rules:
- Very easy language
- Short explanation  
- Paragraph format only

Topic:
${content}

IMPORTANT: Use ONLY Class 7 level words and sentences!
`;
        }

        if (feature === "questions") {
          return `
${languageRule}

**CLASS 7: Generate EXACTLY 8 simple questions ONLY.**

Rules:
- Very easy language
- Basic What/Why questions
- Class 7 level only
- **8 QUESTIONS MAXIMUM**

Topic:
${content}

**Output ONLY 8 questions. No more.**
`;
        }
      }

      // ---------- CLASS 8 (8 QUESTIONS) ----------
      if (category === "8") {
        if (feature === "notes") {
          return `
${languageRule}

Create structured notes for Class 8.

Format:
- Title
- Definition  
- Explanation
- Process
- Result
- Revision Box

Topic:
${content}

IMPORTANT: Class 8 level language ONLY!
`;
        }

        if (feature === "questions") {
          return `
${languageRule}

**CLASS 8: Generate EXACTLY 8 questions ONLY.**

Rules:
- Class 8 language
- **8 QUESTIONS MAXIMUM**
- Structured format

Topic:
${content}

**Output ONLY 8 questions. No more.**
`;
        }
      }

      // ---------- REST SAME (9,10,11,12,College) ----------
      if (category === "9") {
        if (feature === "notes") {
          return `
${languageRule}

Create academic notes for Class 9.

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
${languageRule}

Create structured question paper for Class 9.

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

      if (category === "10") {
        if (feature === "notes") {
          return `
${languageRule}

Create full board-level notes for Class 10 CBSE.

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
${languageRule}

Create full board exam paper for Class 10.

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

      if (category === "11") {
        if (feature === "notes") {
          return `
${languageRule}

Create advanced concept notes for Class 11.

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
${languageRule}

Create 25-question paper for Class 11.

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

      if (category === "12") {
        if (feature === "notes") {
          return `
${languageRule}

Create mastery-level notes for Class 12 CBSE.

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
${languageRule}

Create advanced board + competitive paper for Class 12.

Include:
- HOTS Questions
- Application Based
- Case Study

Topic:
${content}
`;
        }
      }

      if (category === "college") {
        if (feature === "notes") {
          return `
${languageRule}

Create detailed academic notes for College.

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
${languageRule}

Create advanced analytical paper for College.

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
            content: "You are a strict academic AI. Generate structured educational content based on EXACT class level specified. Use ONLY the language level instructed. Follow format exactly. NO extra commentary. RESPECT QUESTION COUNT LIMITS."
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
