const studentMapping = { 
    junior: ["Class 6", "Class 7", "Class 8"], 
    focus: ["Class 9", "Class 11"], 
    exam: ["Class 10", "Class 12"], 
    college: ["College Level"] 
};

// Backend API
const API_URL = "/api/chat"; 

// --- DOM ELEMENTS ---
const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const modal = document.getElementById('previewModal');
const modalText = document.getElementById('modalText'); 

// --- AI QUERY FUNCTION (FINAL FIXED) ---
async function getAIResponse(prompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ message: prompt })
        });

        if (!response.ok) {
            return "Server error: " + response.status;
        }
        
        const data = await response.json();

        // ✅ ONLY BACKEND FIX (UI untouched)
        return data.reply || "AI did not return a proper response.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error ❌: " + error.message;
    }
}

// --- LOGIC ---
function refreshClasses() {
    const items = studentMapping[category.value];
    classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

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

// --- SIMPLIFY BUTTON ---
document.getElementById('btnSimplify').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Simplifying notes... ⏳";

    const output = await getAIResponse(
        `Simplify these notes for ${classList.value}: ${notes.value}`
    );

    result.innerHTML = `
        <h3 style="color:var(--teal)">Simplified by Novabyte AI</h3>
        <p>${output}</p>
    `;
};

// --- QUESTIONS BUTTON ---
document.getElementById('btnQuestions').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Generating questions... ⏳";

    const output = await getAIResponse(
        `Create 5 practice questions for ${classList.value} based on: ${notes.value}`
    );

    result.innerHTML = `
        <h3 style="color:var(--orange)">AI Generated Questions</h3>
        <p>${output}</p>
    `;
};

// --- COPY BUTTON ---
document.getElementById('btnCopy').onclick = () => {
    navigator.clipboard.writeText(result.innerText);
    alert("Result copied!");
};
