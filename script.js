const studentMapping = { 
  junior: ["Class6", "Class7", "Class8"], 
  focus: ["Class9", "Class11"], 
  exam: ["Class10", "Class12"], 
  college: ["College"] 
};

const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const API_URL = "/api/chat";

// Refresh Classes
function refreshClasses() {
  const items = studentMapping[category.value] || [];
  classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// Build final prompt (meeting ke rules follow karega)
function buildFinalPrompt(className, feature, topic) {
  let rules = "";
  if(["Class6","Class7","Class8"].includes(className)) {
    rules = `
- Simplify notes: 3-6 bullet points, short, readable, easy to grasp.
- Revision box included.
- Highlight keywords for Class7 & 8.
- Questions: basic only for Class6, basic+conceptual+1 application for Class8.
`;
  } else if(["Class9","Class11"].includes(className)) {
    rules = `
- Notes: 4-7 bullets, clear explanation, highlight keywords.
- Revision box included.
- Questions: basic + conceptual + 1-2 application/thinking.
`;
  } else if(["Class10","Class12"].includes(className)) {
    rules = `
- Notes: 6-10 key points, short paragraphs, bold keywords + explanations.
- Revision box with "Why It Matters" & exam tips.
- Questions: basic + conceptual + application + high-probability board questions.
`;
  } else if(className === "College") {
    rules = `
- Notes: 6-8 key points, paragraphs with bold keywords + examples.
- Revision box with quick tips.
- Questions: basic + conceptual + application + 1-2 advanced problem-solving.
`;
  }

  return `
You are an AI teaching assistant. Class: ${className}, Feature: ${feature}. Topic: """${topic}""".
Follow these rules strictly:
${rules}
Output in markdown, structured, readable. Include Notes, Revision Box, Highlighted keywords, Questions (Basic, Conceptual, Application).
`;
}

// AI call
async function getAIResponse(className, feature, topic) {
  const prompt = buildFinalPrompt(className, feature, topic);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  return data.reply || "No response";
}

// Format result
function formatOutput(output, feature) {
  if(feature==="simplifyNotes") {
    return `<h3 style="color:teal">Simplified by Novabyte AI</h3><pre>${output}</pre>`;
  } else {
    return `<h3 style="color:orange">AI Generated Questions</h3><pre>${output}</pre>`;
  }
}

// Simplify Notes
document.getElementById('btnSimplify').onclick = async () => {
  if(!notes.value.trim()) return alert("Enter notes!");
  result.innerText = "Simplifying... ⏳";
  const output = await getAIResponse(classList.value, "simplifyNotes", notes.value);
  result.innerHTML = formatOutput(output, "simplifyNotes");
};

// Generate Questions
document.getElementById('btnQuestions').onclick = async () => {
  if(!notes.value.trim()) return alert("Enter notes!");
  result.innerText = "Generating questions... ⏳";
  const output = await getAIResponse(classList.value, "generateQuestions", notes.value);
  result.innerHTML = formatOutput(output, "generateQuestions");
};

// Copy Result
document.getElementById('btnCopy').onclick = () => {
  navigator.clipboard.writeText(result.innerText);
  alert("Copied!");
};
