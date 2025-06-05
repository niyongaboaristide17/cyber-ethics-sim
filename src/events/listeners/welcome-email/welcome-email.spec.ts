import { Test, TestingModule } from '@nestjs/testing';
import { WelcomeEmail } from './welcome-email';

describe('WelcomeEmail', () => {
  let provider: WelcomeEmail;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WelcomeEmail],
    }).compile();

    provider = module.get<WelcomeEmail>(WelcomeEmail);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
