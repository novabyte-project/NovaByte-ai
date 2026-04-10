// ---------- CLASS MAPPING ----------
const studentMapping = { 
    junior: ["Class 6", "Class 7", "Class 8"], 
    focus: ["Class 9", "Class 11"], 
    exam: ["Class 10", "Class 12"], 
    college: ["College Level"] 
};

// Convert UI class → backend category
function mapClassToCategory(cls) {
    if (cls === "Class 6" || cls === "Class 7") return "6-7";
    if (cls === "Class 8") return "8";
    if (cls === "Class 9") return "9";
    if (cls === "Class 10") return "10";
    if (cls === "Class 11") return "11";
    if (cls === "Class 12") return "12";
    if (cls === "College Level") return "college";
}

// ---------- API ----------
const API_URL = "/api/chat";

// ---------- DOM ----------
const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const modal = document.getElementById('previewModal');
const modalText = document.getElementById('modalText');

// ---------- API CALL ----------
async function getAIResponse(message, feature, category) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ message, feature, category })
        });

        if (!response.ok) {
            return "Server error: " + response.status;
        }
        
        const data = await response.json();
        return data.reply || "AI did not return a proper response.";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error ❌: " + error.message;
    }
}

// ---------- CLASS DROPDOWN ----------
function refreshClasses() {
    const items = studentMapping[category.value];
    classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// ---------- PREVIEW ----------
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

// ---------- SIMPLIFY ----------
document.getElementById('btnSimplify').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "simplified notes... ⏳";

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "notes",
        categoryValue
    );

    result.innerHTML = `
        <h3 style="color:var(--teal)">Simplified by Novabyte AI</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- QUESTIONS ----------
document.getElementById('btnQuestions').onclick = async () => {
    if(!notes.value.trim()) return alert("Please enter notes!");

    result.innerText = "Generating questions... ⏳";

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "questions",
        categoryValue
    );

    result.innerHTML = `
        <h3 style="color:var(--orange)">AI Generated Practice Paper</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- COPY ----------
document.getElementById('btnCopy').onclick = () => {
    navigator.clipboard.writeText(result.innerText);
    alert("Result copied!");
};
