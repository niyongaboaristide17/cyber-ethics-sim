// email.service.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * EmailService is responsible for queuing email-related jobs.
 * It decouples email sending logic from the main request flow by using a queue (BullMQ).
 * This allows emails to be sent asynchronously in the background.
 */
@Injectable()
export class EmailService {
  /**
   * Constructor to inject dependencies.
   * @param emailQueue - BullMQ queue instance for processing 'email' jobs.
   */
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  /**
   * Queues a password reset email job.
   * @param email - The recipient's email address.
   * @param token - A JWT token used for resetting the password.
   *
   * This method adds a job to the 'email' queue with type 'password-reset'
   * and includes necessary data (email and token) for the email processor to use.
   */
  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.emailQueue.add('password-reset', { email, token });
  }
}
