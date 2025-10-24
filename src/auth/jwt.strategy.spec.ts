import { Test } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  it('validate maps payload to AuthUser', async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('secret') } },
      ],
    }).compile();

    const strat = module.get(JwtStrategy);
    const res = strat.validate({ email: 'a@a.com', sub: 1 } as any);
    expect(res).toEqual({ id: 1, email: 'a@a.com' });
  });

  it('constructs with fallback secret when config missing', async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();
    const strat = module.get(JwtStrategy);
    expect(strat).toBeDefined();
  });
});
