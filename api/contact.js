import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ message: "Missing fields" });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: "New Contact Form Message",
            text: `Email: ${email}\n\nMessage: ${message}`
        };

        await transporter.sendMail(mailOptions);

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
