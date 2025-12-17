import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  try {
    // Use default sender if not provided
    const sender = from || process.env.EMAIL_FROM || 'noreply@bicicita.app';

    // Skip sending email if in test/development without proper configuration
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Skipping email send (no RESEND_API_KEY configured)');
      console.log('[Email] Would send email with subject:', subject.substring(0, 50));
      return true;
    }

    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return false;
    }

    console.log('[Email] Sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Unexpected error:', error);
    return false;
  }
}

/**
 * Email template for friend request notification
 */
export function getFriendRequestEmailTemplate(
  recipientName: string,
  requesterName: string,
  acceptUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Friend Request</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #FE3C72;
            margin: 0;
          }
          .content {
            background-color: white;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #FE3C72;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚴 Bicicita</h1>
          </div>
          <div class="content">
            <h2>New Friend Request</h2>
            <p>Hi ${recipientName},</p>
            <p><strong>${requesterName}</strong> wants to connect with you on Bicicita!</p>
            <p>Accept this friend request to start chatting and sharing your cycling adventures together.</p>
            <div style="text-align: center;">
              <a href="${acceptUrl}" class="button">View Friend Request</a>
            </div>
          </div>
          <div class="footer">
            <p>If you didn't expect this email, you can safely ignore it.</p>
            <p>&copy; ${new Date().getFullYear()} Bicicita. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Email template for friend request accepted notification
 */
export function getFriendRequestAcceptedEmailTemplate(
  recipientName: string,
  accepterName: string,
  profileUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Friend Request Accepted</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 8px;
            padding: 30px;
            border: 1px solid #e0e0e0;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #FE3C72;
            margin: 0;
          }
          .content {
            background-color: white;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #FE3C72;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚴 Bicicita</h1>
          </div>
          <div class="content">
            <h2>Friend Request Accepted! 🎉</h2>
            <p>Hi ${recipientName},</p>
            <p><strong>${accepterName}</strong> has accepted your friend request!</p>
            <p>You're now friends on Bicicita. Start chatting and plan your next ride together!</p>
            <div style="text-align: center;">
              <a href="${profileUrl}" class="button">Visit Profile</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Bicicita. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
