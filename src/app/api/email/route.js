import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { isUserAdmin } from '../../utils/adminUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

// Initialize supabase only if environment variables are available
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Gmail SMTP configuration
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'bepro.sunday@gmail.com',
    pass: 'firl mldr uvdb lahi'
  },
  tls: {
    rejectUnauthorized: false
  }
});

// HTML email template
const createEmailTemplate = (postContent, authorUsername) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Announcement - BePro</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: linear-gradient(135deg, #ff7b00 0%, #ffb347 100%);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          color: white;
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
          color: rgba(255,255,255,0.9);
          font-size: 16px;
          font-weight: 500;
        }
        .content {
          background: white;
          padding: 40px 30px;
        }
        .announcement-badge {
          display: inline-block;
          background: linear-gradient(135deg, #ff7b00, #ffb347);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }
        .author-info {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .author-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
        .post-content {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #ff7b00;
          margin: 20px 0;
        }
        .post-text {
          font-size: 16px;
          line-height: 1.5;
          color: #555;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #ff7b00, #ffb347);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 25px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          transition: all 0.3s ease;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .footer a {
          color: #ff7b00;
          text-decoration: none;
        }
        @media (max-width: 600px) {
          .email-container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .header h1 {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>BePro</h1>
          <p>New Announcement Available</p>
        </div>
        
        <div class="content">
          <div class="announcement-badge">🚀 New Announcement</div>
          
          <div class="author-info">
            <div class="author-name">From: ${authorUsername}</div>
          </div>
          
          <div class="post-content">
            <div class="post-text">${postContent.substring(0, 300)}${postContent.length > 300 ? '...' : ''}</div>
          </div>
          
          <a href="#" class="cta-button">View Full Announcement</a>
        </div>
        
        <div class="footer">
          <p>You're receiving this because you're a valued member of the BePro community.</p>
          <p><a href="#">Visit BePro</a> | <a href="#">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email to all users
const sendNewPostNotification = async (postContent, authorUsername) => {
  try {
    // Check if supabase is available
    if (!supabase) {
      return { success: false, error: 'Database connection not available' };
    }

    // Get all user emails from profile table
    const { data: users, error } = await supabase
      .from('profile')
      .select('email, username')
      .not('email', 'is', null);

    if (error) {
      console.error('Error fetching user emails:', error);
      return { success: false, error: 'Failed to fetch user emails' };
    }

    if (!users || users.length === 0) {
      return { success: true, message: 'No users found to notify' };
    }

    // Create email template
    const htmlTemplate = createEmailTemplate(postContent, authorUsername);

    // Send emails in batches to avoid rate limits
    const batchSize = 10;
    const results = [];

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (user) => {
        try {
          const mailOptions = {
            from: {
              name: 'BePro Platform',
              address: 'bepro.sunday@gmail.com'
            },
            to: user.email,
            subject: `🚀 New Announcement from ${authorUsername} - BePro`,
            html: htmlTemplate,
            priority: 'normal'
          };

          const info = await transporter.sendMail(mailOptions);
          return { 
            email: user.email, 
            success: true, 
            messageId: info.messageId 
          };
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          return { 
            email: user.email, 
            success: false, 
            error: error.message 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: true,
      message: `Email notifications sent: ${successful} successful, ${failed} failed`,
      details: results
    };

  } catch (error) {
    console.error('Error in sendNewPostNotification:', error);
    return { success: false, error: error.message };
  }
};

// Verify SMTP connection on startup
const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service ready');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
};

// POST endpoint to send emails when new post is created
export async function POST(request) {
  try {
    // Check if supabase is available
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable - database connection not configured' },
        { status: 503 }
      );
    }

    const { postContent, authorUsername, userEmail } = await request.json();

    // Verify admin access
    if (!userEmail || !(await isUserAdmin(userEmail))) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required for post creation.' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!postContent || !authorUsername) {
      return NextResponse.json(
        { error: 'Missing required fields: postContent and authorUsername are required' },
        { status: 400 }
      );
    }

    // Verify email connection
    const connectionValid = await verifyEmailConnection();
    if (!connectionValid) {
      return NextResponse.json(
        { error: 'Email service not available' },
        { status: 503 }
      );
    }

    // Send notification emails
    const result = await sendNewPostNotification(postContent, authorUsername);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing email service
export async function GET(request) {
  try {
    // Check if supabase is available
    if (!supabase) {
      return NextResponse.json({
        error: 'Service temporarily unavailable - database connection not configured',
        emailServiceStatus: 'Database Unavailable',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        fromAddress: 'bepro.sunday@gmail.com'
      }, { status: 503 });
    }

    const userEmail = request.headers.get('x-user-email');
    
    // Check admin access for testing
    if (!userEmail || !(await isUserAdmin(userEmail))) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Verify email connection
    const connectionValid = await verifyEmailConnection();
    
    return NextResponse.json({
      emailServiceStatus: connectionValid ? 'Connected' : 'Failed',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      fromAddress: 'bepro.sunday@gmail.com'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check email service status' },
      { status: 500 }
    );
  }
}