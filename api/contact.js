import nodemailer from "nodemailer";

export default async function handler(req, res) {
  console.log("API HIT");

  if (req.method !== "POST") {
    return res.status(200).json({ message: "API working (GET)" });
  }

  const { email, message } = req.body;

  try {
    console.log("EMAIL USER:", process.env.GMAIL_PASS ? "SET" : "NOT SET");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "novabyte888@gmail.com",
        pass: process.env.GMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Website" <${email}>`,
      to: "novabyte888@gmail.com",
      subject: "Test Message",
      text: message
    });

    return res.status(200).json({ message: "Email sent OK" });

  } catch (error) {
    console.log("ERROR:", error);

    return res.status(500).json({
      message: "Backend error",
      error: error.message
    });
  }
}
