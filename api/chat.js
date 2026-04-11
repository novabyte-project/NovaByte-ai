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

    // ---------- LANGUAGE LEVEL CONTROLLER ----------
    function getLanguageInstruction(category) {
      const levels = {
        "6-7": "Use Class 6 language ONLY. VERY SIMPLE words. Short sentences. Like explaining to 11-year-old kid. NO big words!",
        "8": "Use Class 8 language ONLY. Simple school words. Easy examples. NO Class 10 words!",
        "9": "Use Class 9 language ONLY. School level words. Clear examples. NO board exam complexity!",
        "10": "Use Class 10 CBSE language ONLY. Board exam words OK. NO Class 11/12 complexity!",
        "11": "Use Class 11 language ONLY. Intermediate level. NO college terms!",
        "12": "Use Class 12 CBSE language ONLY. Board level. NO college/engineering terms!",
        "college": "College undergraduate level OK. Technical terms allowed."
      };
      return levels[category] || "Use simple Class 10 language";
    }

    // ---------- PROMPT ENGINE (MINIMAL FIX) ----------
    function getPrompt(feature, category, content) {
      const languageRule = getLanguageInstruction(category);

      // ---------- CLASS 6–7 ----------
      if (category === "6-7") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 8 SIMPLE QUESTIONS. NO intro/paper text.

1. What is...?
2. Why do...?
3. Name 2 examples...
4. True/False...
5. Fill blanks...
6. Match...
7. Draw...
8. Short answer...

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 8 ----------
      if (category === "8") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 10 QUESTIONS. Numbered list only.

1. [1M] Define...
2. [1M] State...
3. [2M] Explain...
4. [2M] List...
5. [3M] Describe...
6. [3M] Difference...
7-10. [Case Study]

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 9 ----------
      if (category === "9") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 12 QUESTIONS. Clean numbered format.

1-3. [1 Mark]
4-6. [2 Marks]
7-9. [3 Marks]
10-12. [Case Study]

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 10 ----------
      if (category === "10") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 15 QUESTIONS. Direct numbered list.

1-5. [1 Mark]
6-10. [2 Marks]
11-13. [3 Marks]
14. [5 Marks]
15. [Case Study]

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 11 ----------
      if (category === "11") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 18 QUESTIONS. Clean format.

1-4. Basic [1M]
5-8. Short [2M]
9-12. Long [3M]
13-16. Application [4M]
17-18. Case Study

Topic:
${content}
`;
        }
      }

      // ---------- CLASS 12 ----------
      if (category === "12") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 20 QUESTIONS. HOTS focus.

1-5. Knowledge
6-10. Understanding
11-15. Application
16-20. Analysis + Case

Topic:
${content}
`;
        }
      }

      // ---------- COLLEGE ----------
      if (category === "college") {
        if (feature === "notes") {
          return `
${languageRule}

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
${languageRule}

Generate ONLY 15 QUESTIONS. Analytical.

1-5. Conceptual
6-10. Analytical
11-13. Application
14-15. Case Study

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
            content: "Strict Academic AI. Generate ONLY what's asked. QUESTIONS: Numbered list ONLY. NO intro/paper text. NO extra commentary. EXACT class level language."
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
