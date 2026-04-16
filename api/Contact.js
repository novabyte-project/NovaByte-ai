// api/contact.js (NEW FILE - ADD THIS)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: 'Email and message required' });
  }

  // Create transporter (Gmail)
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: 'novabyte888@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD // ← NEED THIS
    }
  });

  try {
    await transporter.sendMail({
      from: '"Novabyte AI" <novabyte888@gmail.com>',
      to: 'novabyte888@gmail.com',
      replyTo: email,
      subject: `New Contact Form: ${email}`,
      html: `
        <h2>New Message from ${email}</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <pre style="background:#f5f5f5;padding:15px;border-radius:5px">${message}</pre>
      `
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
      }
