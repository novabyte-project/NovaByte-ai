// CATEGORY & CLASS MAPPING
const studentMapping = { 
    junior: ["Class6", "Class7", "Class8"], 
    focus: ["Class9", "Class11"], 
    exam: ["Class10", "Class12"], 
    college: ["College"] 
};

// DOM ELEMENTS
const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const modal = document.getElementById('previewModal');
const modalText = document.getElementById('modalText'); 

const API_URL = "/api/chat"; 

// Refresh Classes Dropdown
function refreshClasses() {
    const items = studentMapping[category.value] || [];
    classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// Preview Modal
document.getElementById('previewBtn').onclick = () => {
    if(notes.value.trim() === "") alert("Please paste some notes first!");
    else { 
        modalText.value = notes.value;
        modal.style.display = "block"; 
    }
};

document.getElementById('closeModal').onclick = () => {
    notes.value = modalText.value; 
    modal.style.display = "none";
};

// AI Query
async function getAIResponse(className, feature, topic) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ className, feature, topic })
        });

        if (!response.ok) return "Server error: " + response.status;
        
        const data = await response.json();
        return data.reply || "AI did not return a proper response.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error ❌: " + error.message;
    }
}

// 🔥 SMART FORMAT FUNCTION
function formatNotes(output) {
    const lines = output.split("\n").filter(l => l.trim() !== "");

    return `
        <h3 style="color:var(--teal)">Simplified by Novabyte AI</h3>

        <ul>
            ${lines.slice(0,6).map(l => `<li>${l}</li>`).join("")}
        </ul>

        <h4>Why It Matters</h4>
        <p>${lines.slice(6,9).join(" ") || "This topic is important for understanding concepts and exams."}</p>

        <h4>Revision Box</h4>
        <p>${lines.slice(0,3).join(" ")}</p>
    `;
}

// 🔥 SMART QUESTIONS FORMAT
function formatQuestions(output) {
    const parts = output.split("\n").filter(l => l.trim() !== "");

    return `
        <h3 style="color:var(--orange)">AI Generated Questions</h3>

        <h4>Basic Questions</h4>
        ${parts.slice(0,3).map((q,i)=>`<p>${i+1}. ${q}</p>`).join("")}

        <h4>Conceptual Questions</h4>
        ${parts.slice(3,6).map((q,i)=>`<p>${i+4}. ${q}</p>`).join("")}

        <h4>Application Questions</h4>
        ${parts.slice(6,8).map((q,i)=>`<p>${i+7}. ${q}</p>`).join("")}
    `;
}

// Simplify Notes
document.getElementById('btnSimplify').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Simplifying notes... ⏳";

    const output = await getAIResponse(classList.value, "simplifyNotes", notes.value);

    result.innerHTML = formatNotes(output);
};

// Generate Questions
document.getElementById('btnQuestions').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Generating questions... ⏳";

    const output = await getAIResponse(classList.value, "generateQuestions", notes.value);

    result.innerHTML = formatQuestions(output);
};

// Copy
document.getElementById('btnCopy').onclick = () => {
    navigator.clipboard.writeText(result.innerText);
    alert("Result copied!");
};
