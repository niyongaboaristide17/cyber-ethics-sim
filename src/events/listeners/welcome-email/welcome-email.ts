import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '../../events/user-registered.event/user-registered.event';

@Injectable()
export class WelcomeEmailListener {
  @OnEvent('user.register')
  handleUserRegistered(event: UserRegisteredEvent) {
    console.log(`Sending welcome email to: ${event.email}`);
  }
}
