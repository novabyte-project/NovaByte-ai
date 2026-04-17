// ---------- CLASS MAPPING ----------
const studentMapping = { 
    junior: ["Class 6", "Class 7", "Class 8"], 
    focus: ["Class 9", "Class 11"], 
    exam: ["Class 10", "Class 12"], 
    college: ["College Level"] 
};

// ---------- CATEGORY CONVERTER ----------
function mapClassToCategory(cls) {
    cls = cls.toLowerCase().trim();

    if (cls.includes("6") || cls.includes("7")) return "6-7";
    if (cls.includes("8")) return "8";
    if (cls.includes("9")) return "9";
    if (cls.includes("10")) return "10";
    if (cls.includes("11")) return "11";
    if (cls.includes("12")) return "12";
    if (cls.includes("college")) return "college";

    return "10";
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

// ---------- API CALL ----------
async function getAIResponse(message, feature, category) {
    // 🌐 INTERNET CHECK BEFORE FETCH
    if (!navigator.onLine) {
        return "NETWORK_OFFLINE";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message, 
                feature, 
                category
            })
        });

        if (!response.ok) return "Server error: " + response.status;

        const data = await response.json();
        return data.reply || "No response from AI";

    } catch (error) {
        console.error("Fetch Error:", error);
        return "Error ❌: " + error.message;
    }
}

// ---------- SHARED NETWORK ERROR UI (OPTION 1) ----------
function showNetworkError() {
    result.innerHTML = `
        <div style="color:#ea580c; padding:15px; border:1px solid #ea580c; border-radius:12px; background: rgba(234, 88, 12, 0.05); text-align:center;">
            <h4 style="margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:10px;">
                <i class="fas fa-wifi-slash"></i> Connection Lost
            </h4>
            <p style="font-size:13px; color:var(--text-dim); line-height:1.5;">
                Please check your internet settings to continue with NovaByte AI.
            </p>
        </div>
    `;
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
    if (!notes.value.trim()) return alert("Please paste some notes first!");

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

    // 🧹 Purana kachra saaf karo
    result.innerHTML = ''; 
    isLoading = true;
    result.innerText = "Simplifying... ⏳";

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "notes",
        categoryValue
    );

    isLoading = false;

    // 🌐 OFFLINE HANDLING
    if (output === "NETWORK_OFFLINE") {
        showNetworkError();
        return;
    }

    result.innerHTML = `
        <h3 style="color:var(--teal); margin-bottom:10px;">Simplified by Novabyte AI</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- QUESTIONS ----------
document.getElementById('btnQuestions').onclick = async () => {
    if (isLoading) return;
    if (!notes.value.trim()) return alert("Please enter notes!");

    // 🧹 Purana kachra saaf karo
    result.innerHTML = ''; 
    isLoading = true;
    result.innerText = "Generating questions... ⏳";

    const categoryValue = mapClassToCategory(classList.value);

    const output = await getAIResponse(
        notes.value,
        "questions",
        categoryValue
    );

    isLoading = false;

    // 🌐 OFFLINE HANDLING
    if (output === "NETWORK_OFFLINE") {
        showNetworkError();
        return;
    }

    result.innerHTML = `
        <h3 style="color:var(--orange); margin-bottom:10px;">AI Generated Questions</h3>
        <pre style="white-space:pre-wrap">${output}</pre>
    `;
};

// ---------- COPY ----------
document.getElementById('btnCopy').onclick = () => {
    const text = result.querySelector("pre")?.innerText || result.innerText;
    navigator.clipboard.writeText(text);
    alert("Copied!");
};

// ===== FOOTER CONTACT JS =====
function handleSend() {
    if (!navigator.onLine) {
        alert("Connection Lost: Please check your internet settings.");
        return;
    }

    const email = document.getElementById('userEmail').value;
    const message = document.getElementById('userMessage').value;

    const btn = document.querySelector('.send-icon-btn');
    btn.innerHTML = '<span style="font-size: 13px;">Sending...</span>';

    fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            message: message
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = '<span style="font-size: 13px;">Sent!</span> <i class="fas fa-check"></i>';

        setTimeout(() => {
            document.getElementById('contactBox').style.display = 'none';
            btn.innerHTML = '<span style="font-size: 13px;">Send Message</span> <i class="fas fa-paper-plane"></i>';
        }, 1500);

        alert(data.message);
    })
    .catch(err => {
        alert("Error sending message. Check connection.");
        console.log(err);
        btn.innerHTML = '<span style="font-size: 13px;">Send Message</span> <i class="fas fa-paper-plane"></i>';
    });
}

window.onclick = function(event) {
    var modal = document.getElementById('contactBox');
    if (event.target == modal) { 
        modal.style.display = 'none'; 
    }
}
