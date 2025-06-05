import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordReset(email: string, token: string) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: '🔒 Password Reset Request',
      html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
  
  <!-- Header -->
  <div style="text-align: center; padding-bottom: 20px;">
    <h1 style="color: #007bff; font-size: 28px; margin: 0;">🔑 YourApp</h1>
    <p style="color: #666; font-size: 16px; margin-top: 8px;">Reset Your Password</p>
  </div>

  <!-- Body -->
  <div style="background: white; padding: 25px 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
    <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello there,</p>

    <p style="color: #333; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password. Please click the button below to proceed.
      This link will expire in <strong style="color: #007bff;">15 minutes</strong>.
    </p>

    <!-- Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background: linear-gradient(135deg, #007bff, #0056b3); color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(0,123,255,0.3);">
        🔁 Reset Password
      </a>
    </div>

    <p style="color: #888; font-size: 14px; margin-top: 20px;">
      If you didn’t request a password reset, you can safely ignore this email.
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #aaa;">
    <p style="margin: 0;">© 2025 YourApp. All rights reserved.</p>
    <p style="margin: 8px 0 0;">📩 This is an automated message. Please do not reply.</p>
  </div>

</div>
  `,
    });
    return { message: 'Password reset email sent' };
  }
}
