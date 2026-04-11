// ---------- CATEGORY SYSTEM ----------
function getFinalCategory() {
    return category.value; // junior / focus / exam / college
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

// ---------- LOADING ----------
let isLoading = false;

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

        const data = await response.json();

        return data.reply || "No response";
    } catch (error) {
        return "Error ❌: " + error.message;
    }
}

// ---------- CLASS DROPDOWN ----------
const studentMapping = {
    junior: ["Class 6", "Class 7", "Class 8"],
    focus: ["Class 9", "Class 11"],
    exam: ["Class 10", "Class 12"],
    college: ["College Level"]
};

function refreshClasses() {
    const items = studentMapping[category.value];
    classList.innerHTML = items
        .map(item => `<option value="${item}">${item}</option>`)
        .join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// ---------- SIMPLIFY ----------
document.getElementById('btnSimplify').onclick = async () => {
    if (isLoading) return;
    if (!notes.value.trim()) return alert("Please enter notes!");

    isLoading = true;
    result.innerText = "Simplifying... ⏳";

    const output = await getAIResponse(
        notes.value,
        "notes",
        getFinalCategory()
    );

    isLoading = false;

    result.innerHTML = `
        <h3>Simplified Notes</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- QUESTIONS ----------
document.getElementById('btnQuestions').onclick = async () => {
    if (isLoading) return;
    if (!notes.value.trim()) return alert("Please enter notes!");

    isLoading = true;
    result.innerText = "Generating... ⏳";

    const output = await getAIResponse(
        notes.value,
        "questions",
        getFinalCategory()
    );

    isLoading = false;

    result.innerHTML = `
        <h3>Questions</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- COPY ----------
document.getElementById('btnCopy').onclick = () => {
    const text = result.querySelector("pre")?.innerText || result.innerText;
    navigator.clipboard.writeText(text);
    alert("Copied!");
};
