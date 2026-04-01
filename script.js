const studentMapping = { 
    junior: ["Class 6", "Class 7", "Class 8"], 
    focus: ["Class 9", "Class 11"], 
    exam: ["Class 10", "Class 12"], 
    college: ["College Level"] 
};

// Vercel API Route
const API_URL = "/api/chat"; 

// --- DOM ELEMENTS ---
const category = document.getElementById('categorySelect');
const classList = document.getElementById('classSelect');
const notes = document.getElementById('studentNotes');
const result = document.getElementById('resultBox');
const modal = document.getElementById('previewModal');
const modalText = document.getElementById('modalText'); 

// --- AI QUERY FUNCTION ---
async function getAIResponse(userPrompt) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            // ✅ FIXED: prompt → message
            body: JSON.stringify({ message: userPrompt })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return "Server Error (" + response.status + "): " + (errorData.text || "Check Vercel Logs");
        }
        
        const data = await response.json();

        // 🔥 Backend can send 'text' or 'reply'. This checks both.
        const aiText = data.text || data.reply || data.botReply;

        if (!aiText) {
            return "⚠️ AI response is empty. Please try again.";
        }

        return aiText;

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Network Error: Please check your internet or Vercel deployment.";
    }
}

// --- REFRESH CLASSES LOGIC ---
function refreshClasses() {
    const selectedCategory = category.value;
    const items = studentMapping[selectedCategory] || [];
    classList.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
}

category.addEventListener('change', refreshClasses);
window.onload = refreshClasses;

// --- PREVIEW MODAL LOGIC ---
document.getElementById('previewBtn').onclick = () => {
    if(notes.value.trim() === "") {
        alert("Please paste some notes first!");
    } else { 
        modalText.value = notes.value;
        modal.style.display = "block"; 
    }
};

document.getElementById('closeModal').onclick = () => {
    notes.value = modalText.value; 
    modal.style.display = "none";
};

// --- API ACTION BUTTONS ---

// 1. Simplify Button
document.getElementById('btnSimplify').onclick = async () => {
    const noteContent = notes.value.trim();
    if(!noteContent) return alert("Please enter notes!");
    
    result.innerText = "Simplifying notes for " + classList.value + "...";
    
    const output = await getAIResponse("Simplify these notes for " + classList.value + ": " + noteContent);
    result.innerHTML = `<h3 style="color:var(--teal)">Simplified by Novabyte AI</h3><p>${output.replace(/\n/g, '<br>')}</p>`;
};

// 2. Questions Button
document.getElementById('btnQuestions').onclick = async () => {
    const noteContent = notes.value.trim();
    if(!noteContent) return alert("Please enter notes!");
    
    result.innerText = "Generating practice questions...";
    
    const output = await getAIResponse("Create 5 practice questions for " + classList.value + " based on these notes: " + noteContent);
    result.innerHTML = `<h3 style="color:var(--orange)">AI Generated Questions</h3><p>${output.replace(/\n/g, '<br>')}</p>`;
};

// 3. Copy Button
document.getElementById('btnCopy').onclick = () => {
    if(!result.innerText || result.innerText.includes("Simplifying")) return;
    navigator.clipboard.writeText(result.innerText);
    alert("Result copied to clipboard!");
};
