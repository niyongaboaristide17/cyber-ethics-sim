import { Module } from '@nestjs/common';
import { WelcomeEmailListener } from './listeners/welcome-email/welcome-email';

@Module({
  providers: [WelcomeEmailListener],
})
export class EventsModule {}
