import nodemailer from "nodemailer";

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Only POST allowed" });
        }

        const { email, message } = req.body || {};

        if (!email || !message) {
            return res.status(400).json({ message: "Missing data" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: "Contact Form Message",
            text: `From: ${email}\nMessage: ${message}`
        });

        return res.status(200).json({ message: "Email sent successfully" });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
}
