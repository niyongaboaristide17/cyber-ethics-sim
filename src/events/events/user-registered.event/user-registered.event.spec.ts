import { UserRegisteredEvent } from './user-registered.event';

describe('UserRegisteredEvent', () => {
  it('should be defined', () => {
    expect(new UserRegisteredEvent()).toBeDefined();
  });
});
