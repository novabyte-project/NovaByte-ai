import nodemailer from "nodemailer";

export default async function handler(req, res) {
    res.setHeader("Content-Type", "application/json");

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { email, message } = req.body;

        if (!email || !message) {
            return res.status(400).json({ message: "Missing email or message" });
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
            text: `From: ${email}\n\nMessage:\n${message}`
        });

        return res.status(200).json({
            message: "Email sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Email failed",
            error: error.message
        });
    }
}
