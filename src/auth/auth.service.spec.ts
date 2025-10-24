import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UsersService>;
  let jwt: jest.Mocked<JwtService>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: { findByEmail: jest.fn(), create: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn(), verify: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    users = module.get(UsersService) as any;
    jwt = module.get(JwtService) as any;
    config = module.get(ConfigService) as any;
  });

  it('validateUser returns user when password matches', async () => {
    users.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com', password: 'hash', name: 'A' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await service.validateUser('a@a.com', 'secret');
    expect(res).toEqual({ id: 1, email: 'a@a.com', name: 'A' });
  });

  it('validateUser returns null when password mismatch', async () => {
    users.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com', password: 'hash', name: 'A' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const res = await service.validateUser('a@a.com', 'bad');
    expect(res).toBeNull();
  });

  it('login returns access and refresh tokens', () => {
    jwt.sign
      .mockReturnValueOnce('access')
      .mockReturnValueOnce('refresh');
    config.get.mockReturnValueOnce(undefined as any); // refreshSecret fallback
    config.get.mockReturnValueOnce(undefined as any); // refreshExpiresIn fallback

    const res = service.login({ id: 1, email: 'a@a.com', name: 'A' });
    expect(jwt.sign).toHaveBeenCalled();
    expect(res).toEqual({ access_token: 'access', refresh_token: 'refresh' });
  });

  it('register hashes password and creates user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    users.create.mockResolvedValue({ id: 2 } as any);
    const res = await service.register({ email: 'a@a.com', password: 'p', name: 'A' });
    expect(bcrypt.hash).toHaveBeenCalledWith('p', 10);
    expect(users.create).toHaveBeenCalledWith({ email: 'a@a.com', password: 'hashed', name: 'A' });
    expect(res).toEqual({ id: 2 });
  });

  it('refresh verifies token and returns new access', () => {
    config.get.mockReturnValueOnce(undefined as any); // refreshSecret fallback
    jwt.verify.mockReturnValue({ email: 'a@a.com', sub: 1 });
    jwt.sign.mockReturnValue('newAccess');
    const res = service.refresh('refresh');
    expect(jwt.verify).toHaveBeenCalled();
    expect(res).toEqual({ access_token: 'newAccess' });
  });
});
