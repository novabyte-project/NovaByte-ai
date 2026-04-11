// ---------- CLASS MAPPING ----------
const studentMapping = { 
    junior: ["Class 6", "Class 7", "Class 8"], 
    focus: ["Class 9", "Class 11"], 
    exam: ["Class 10", "Class 12"], 
    college: ["College Level"] 
};

// Convert UI class → backend category (ENHANCED)
function mapClassToCategory(cls) {
    cls = cls.toLowerCase().trim();

    if (cls.includes("6") || cls.includes("7")) return "6-7";
    if (cls.includes("8")) return "8";
    if (cls.includes("9")) return "9";
    if (cls.includes("10")) return "10";
    if (cls.includes("11")) return "11";
    if (cls.includes("12")) return "12";
    if (cls.includes("college")) return "college";
    
    return "10"; // Default fallback
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

// ---------- LOADING LOCK ----------
let isLoading = false;

// ---------- API CALL (ENHANCED with class info) ----------
async function getAIResponse(message, feature, category, className) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                message, 
                feature, 
                category,
                className  // NEW: Send exact class name for better control
            })
        });

        if (!response.ok) {
            return "Server error: " + response.status;
        }

        const data = await response.json();

        if (!data || !data.reply) {
            return "No response from AI server";
        }

        return data.reply;

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error ❌: " + error.message;
    }
}

// ---------- CLASS DROPDOWN ----------
function refreshClasses() {
    const items = studentMapping[category.value];
    classList.innerHTML = items
        .map(item => `<option value="${item}">${item}</option>`)
        .join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// ---------- PREVIEW ----------
document.getElementById('previewBtn').onclick = () => {
    if(notes.value.trim() === "") {
        alert("Please paste some notes first!");
        return;
    }

    modalText.value = notes.value;
    modal.style.display = "block";
};

document.getElementById('closeModal').onclick = () => {
    notes.value = modalText.value; 
    modal.style.display = "none";
};

// ---------- SIMPLIFY ----------
document.getElementById('btnSimplify').onclick = async () => {
    if (isLoading) return;
    if (!notes.value.trim()) return alert("Please enter notes!");

    isLoading = true;
    result.innerText = "Simplifying... ⏳";  // ✅ FIXED: Simple loading

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "notes",
        categoryValue,
        classList.value
    );

    isLoading = false;

    result.innerHTML = `
        <h3 style="color:var(--teal)">Simplified by Novabyte AI</h3>  <!-- ✅ FIXED: Original tagline -->
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- QUESTIONS ----------
document.getElementById('btnQuestions').onclick = async () => {
    if (isLoading) return;
    if (!notes.value.trim()) return alert("Please enter notes!");

    isLoading = true;
    result.innerText = "Generating questions... ⏳";  // ✅ FIXED: Simple loading

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "questions",
        categoryValue,
        classList.value
    );

    isLoading = false;

    result.innerHTML = `
        <h3 style="color:var(--orange)">AI Generated Questions</h3>  <!-- ✅ FIXED: Clean tagline -->
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- COPY ----------
document.getElementById('btnCopy').onclick = () => {
    const text = result.querySelector("pre")?.innerText || result.innerText;
    navigator.clipboard.writeText(text);
    alert("✅ Copied to clipboard!");
};
