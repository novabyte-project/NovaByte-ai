// api/contact/route.js - COPY PASTE EXACTLY
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, message } = await request.json();

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'novabyte888@gmail.com',
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"Novabyte AI" <novabyte888@gmail.com>',
      to: 'novabyte888@gmail.com',
      replyTo: email,
      subject: `📧 New Contact: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr>
          <p style="color: #64748b; font-size: 12px;">Novabyte AI Contact Form</p>
        </div>
      `
    });

    return Response.json({ message: '✅ Message sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ message: '❌ Failed to send email' }, { status: 500 });
  }
}
