// app/api/contact/route.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),  // Make sure port is a number
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls:{
    rejectUnauthorized: false
  }
});

export async function POST(req) {
  try {
    // Verify environment variables are set
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('Missing email configuration');
      return new Response(
        JSON.stringify({ message: 'Server configuration error' }),
        { status: 500 }
      );
    }

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ message: 'All fields are required' }),
        { status: 400 }
      );
    }

    // Test SMTP connection
    try {
      await transporter.verify();
    } catch (error) {
      console.error('SMTP Verification failed:', error);
      return new Response(
        JSON.stringify({ message: 'Email service configuration error' }),
        { status: 500 }
      );
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Failed to send email', 
        error: error.message 
      }),
      { status: 500 }
    );
  }
}