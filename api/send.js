import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "novabyte888@gmail.com",
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Website User" <${email}>`,
      to: "novabyte888@gmail.com",
      subject: "New Website Message",
      text: `Email: ${email}\nMessage: ${message}`
    });

    return res.status(200).json({ success: true, message: "Email sent" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
