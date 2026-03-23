export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();
    
    const { prompt } = req.body;
    const API_KEY = process.env.API_KEY;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ text: aiText });
    } catch (error) {
        res.status(500).json({ text: "Backend Error: " + error.message });
    }
}
