import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'bepro.sunday@gmail.com',
    pass: 'firl mldr uvdb lahi'
  }
});

export async function POST(request) {
  try {
    const { to, subject, text, html } = await request.json();

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and text/html' },
        { status: 400 }
      );
    }

    // Email options
    const mailOptions = {
      from: 'bepro.sunday@gmail.com',
      to,
      subject,
      text,
      html: html || text // Use html if provided, otherwise fallback to text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test email configuration
export async function GET() {
  try {
    // Verify SMTP connection
    await transporter.verify();
    
    return NextResponse.json({
      success: true,
      message: 'Email service is configured and ready'
    });
  } catch (error) {
    console.error('Email configuration error:', error);
    return NextResponse.json(
      { 
        error: 'Email service configuration error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}