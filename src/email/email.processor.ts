import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * EmailProcessor handles background email jobs using BullMQ.
 * It listens to the 'email' queue and processes different types of emails.
 */
@Processor('email')
export class EmailProcessor extends WorkerHost {
  private transporter: nodemailer.Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  >;

  constructor(private readonly configService: ConfigService) {
    super();

    // Initialize SMTP transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Main entry point for processing a job in the 'email' queue.
   * Routes the job to the appropriate handler based on job name.
   * @param job - The job object containing name and data.
   * @returns Promise<any> result of the specific handler.
   * @throws Error if job type is not supported.
   */
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'password-reset':
        return this.handlePasswordReset(job);

      default:
        throw new Error(`Unsupported job type: ${job.name}`);
    }
  }

  /**
   * Handles password reset email job.
   * Sends an email with a reset link to the user.
   * @param job - The job object containing email and token.
   */
  private async handlePasswordReset(
    job: Job<{ email: string; token: string }>,
  ) {
    const { email, token } = job.data;

    const resetUrl = `${this.configService.get<string>('APP_URL')}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html lang="en" style="margin: 0; padding: 0;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
          }
          .email-container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #4e73df;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            color: #333333;
          }
          .button {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background-color: #4e73df;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            background-color: #f1f1f1;
            text-align: center;
            font-size: 12px;
            color: #888888;
            padding: 15px;
          }
          @media (max-width: 620px) {
            .email-container {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your account password. Click the button below to proceed:</p>
            <a href="${resetUrl}" class="button">Reset Your Password</a>
            <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Aristide-nestJS-starter. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"NEST STARTER" <support@example.com>`,
        to: email,
        subject: '🔒 Password Reset Request',
        html,
      });
    } catch (error) {
      console.error(`Failed to send email to ${email}:`, error.message);
      throw error; // BullMQ will retry based on job options
    }
  }
}
