import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ message: "Email and message are required" });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "novabyte888@gmail.com",
        subject: `New Contact from ${email}`,
        text: `From: ${email}\n\nMessage:\n${message}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Message sent successfully! ✅" });
    } catch (error) {
        console.error("Mail error:", error);
        return res.status(500).json({ message: "Failed to send message ❌" });
    }
}
