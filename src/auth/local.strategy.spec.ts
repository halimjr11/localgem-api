import { Test } from '@nestjs/testing';
import { LocalStrategy } from './local.strategy';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  it('returns user when validateUser succeeds', async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: { validateUser: jest.fn().mockResolvedValue({ id: 1, email: 'a@a.com' }) } },
      ],
    }).compile();

    const strategy = module.get(LocalStrategy);
    await expect(strategy.validate('a@a.com', 'p')).resolves.toEqual({ id: 1, email: 'a@a.com' });
  });

  it('throws Unauthorized when validateUser returns null', async () => {
    const module = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        { provide: AuthService, useValue: { validateUser: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    const strategy = module.get(LocalStrategy);
    await expect(strategy.validate('a@a.com', 'bad')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
