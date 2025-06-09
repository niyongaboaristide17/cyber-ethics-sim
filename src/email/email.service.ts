// email.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailService {
  // constructor(private readonly mailerService: MailerService) {}

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendPasswordReset(email: string, token: string) {
    await this.emailQueue.add('password-reset', { email, token });
  }
}
