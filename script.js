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

// ---------- TOAST SYSTEM ----------
function showToast(message, icon, color) {
    const existing = document.getElementById('nb-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'nb-toast';
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;

    toast.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(-80px);
        background: #11141d;
        color: #ffffff;
        padding: 14px 22px;
        border-radius: 12px;
        border: 1px solid ${color};
        box-shadow: 0 0 20px rgba(0,0,0,0.5), 0 0 10px ${color}44;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 14px;
        font-weight: 600;
        z-index: 99999;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
        opacity: 0;
        white-space: nowrap;
        max-width: 90vw;
    `;

    toast.querySelector('i').style.cssText = `
        color: ${color};
        font-size: 16px;
        flex-shrink: 0;
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });
    });

    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-80px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// ---------- LOADER SYSTEM ----------
function showLoader(type) {
    const color = (type === 'notes') ? '#0d9488' : '#ea580c';
    const text = (type === 'notes') ? 'Analyzing Notes...' : 'Crafting Questions...';
    const rgbColor = (type === 'notes') ? '13, 148, 136' : '234, 88, 12';

    result.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding-top:60px; height:100%; gap:15px;">
            <div style="
                width:35px; height:35px;
                border-radius:50%;
                border: 3px solid rgba(${rgbColor}, 0.1);
                border-top: 3px solid ${color};
                box-shadow: 0 0 15px rgba(${rgbColor}, 0.2);
                animation: nb-spin 0.8s linear infinite;
            "></div>
            <div style="
                font-size:11px; font-weight:700; color:${color};
                letter-spacing:2px; text-transform:uppercase;
                font-family: 'Plus Jakarta Sans', sans-serif;
            ">${text}</div>
        </div>
        <style>
            @keyframes nb-spin { to { transform: rotate(360deg); } }
        </style>
    `;
}

// ---------- API CALL ----------
async function getAIResponse(message, feature, category) {
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

// ---------- DYNAMIC NETWORK ERROR (OPTION 1 WITH EMOJI) ----------
function showNetworkError(type) {
    const activeColor = (type === 'notes') ? '#0d9488' : '#ea580c';
    
    result.innerHTML = `
        <div style="color:${activeColor}; padding:15px; border:1px solid ${activeColor}; border-radius:12px; background: rgba(0, 0, 0, 0.1); text-align:center;">
            <h4 style="margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:10px; color:${activeColor};">
                ⚠️ Connection Lost
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
    if (!notes.value.trim()) {
        showToast("Please paste some notes first!", "fas fa-exclamation-triangle", "#e11d48");
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
    if (!notes.value.trim()) {
        showToast("Please enter notes!", "fas fa-exclamation-circle", "#0d9488");
        return;
    }

    result.innerHTML = '';
    isLoading = true;
    showLoader('notes');

    const categoryValue = mapClassToCategory(classList.value);
    const output = await getAIResponse(notes.value, "notes", categoryValue);

    isLoading = false;

    if (output === "NETWORK_OFFLINE") {
        showNetworkError('notes');
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
    if (!notes.value.trim()) {
        showToast("Please enter notes!", "fas fa-question-circle", "#ea580c");
        return;
    }

    result.innerHTML = '';
    isLoading = true;
    showLoader('questions');

    const categoryValue = mapClassToCategory(classList.value);
    const output = await getAIResponse(notes.value, "questions", categoryValue);

    isLoading = false;

    if (output === "NETWORK_OFFLINE") {
        showNetworkError('questions');
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
    showToast("Copied to Clipboard!", "fas fa-check-double", "#00F5FF");
};

// ===== FOOTER CONTACT JS =====
function handleSend() {
    if (!navigator.onLine) {
        showToast("Connection Lost: Check internet.", "fas fa-wifi", "#e11d48");
        return;
    }

    const email = document.getElementById('userEmail').value;
    const message = document.getElementById('userMessage').value;
    const btn = document.querySelector('.send-icon-btn');
    
    btn.innerHTML = '<span style="font-size: 13px;">Sending...</span>';

    fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, message: message })
    })
    .then(res => res.json())
    .then(data => {
        btn.innerHTML = '<span style="font-size: 13px;">Sent!</span> <i class="fas fa-check"></i>';
        setTimeout(() => {
            document.getElementById('contactBox').style.display = 'none';
            btn.innerHTML = '<span style="font-size: 13px;">Send Message</span> <i class="fas fa-paper-plane"></i>';
        }, 1500);
        showToast("Message Sent Successfully!", "fas fa-paper-plane", "#0d9488");
    })
    .catch(err => {
        showToast("Error sending message. Check connection.", "fas fa-server", "#e11d48");
        btn.innerHTML = '<span style="font-size: 13px;">Send Message</span> <i class="fas fa-paper-plane"></i>';
    });
}

window.onclick = function(event) {
    var modal = document.getElementById('contactBox');
    if (event.target == modal) { modal.style.display = 'none'; }
}
