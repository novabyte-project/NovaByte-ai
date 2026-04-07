// --- CATEGORY & CLASS MAPPING ---
const studentMapping = { 
    junior: ["Class6", "Class7", "Class8"], 
    focus: ["Class9", "Class11"], 
    exam: ["Class10", "Class12"], 
    college: ["College"] 
};

// --- DOM ELEMENTS ---
const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const modal = document.getElementById('previewModal');
const modalText = document.getElementById('modalText'); 

// --- BACKEND API ---
const API_URL = "/api/chat"; 

// --- REFRESH CLASS DROPDOWN ---
function refreshClasses() {
    const items = studentMapping[category.value] || [];
    classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

// --- LOAD INITIAL CLASSES ---
category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// --- PREVIEW MODAL ---
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

// --- AI QUERY FUNCTION ---
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

// --- SIMPLIFY NOTES BUTTON ---
document.getElementById('btnSimplify').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Simplifying notes... ⏳";

    const output = await getAIResponse(classList.value, "simplifyNotes", notes.value);

    result.innerHTML = `
        <h3 style="color:var(--teal)">Simplified by Novabyte AI</h3>
        <pre style="white-space: pre-wrap;">${output}</pre>
    `;
};

// --- GENERATE QUESTIONS BUTTON ---
document.getElementById('btnQuestions').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Generating questions... ⏳";

    const output = await getAIResponse(classList.value, "generateQuestions", notes.value);

    result.innerHTML = `
        <h3 style="color:var(--orange)">AI Generated Questions</h3>
        <pre style="white-space: pre-wrap;">${output}</pre>
    `;
};

// --- COPY BUTTON ---
document.getElementById('btnCopy').onclick = () => {
    navigator.clipboard.writeText(result.innerText);
    alert("Result copied!");
};
