import nodemailer from 'nodemailer';

/**
 * OTP Services Integration
 * Handles delivery of OTPs via Email (Nodemailer)
 */

export async function sendEmailOTP(email: string, otp: string) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'VyapaarSetu <onboarding@yourdomain.com>';

  // Fallback to mock if SMTP credentials are not configured or are placeholders
  const isPlaceholder = (str?: string) => !str || str.includes('your-email') || str.includes('your-app-password') || str === '';
  
  if (isPlaceholder(user) || isPlaceholder(pass)) {
    console.warn(`[OTP MOCK] Email to ${email}: Your OTP is ${otp}. (Set SMTP_USER and SMTP_PASS to send real emails)`);
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Your VyapaarSetu Verification Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0F172A;">VyapaarSetu Verification</h2>
          <p>Your one-time password (OTP) for account creation is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10B981; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #64748B;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, status: 200, messageId: info.messageId };
  } catch (error: any) {
    console.error("Nodemailer Error:", error);
    return { success: false, message: error.message || "Failed to send email" };
  }
}
