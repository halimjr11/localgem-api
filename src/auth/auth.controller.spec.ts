import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const serviceMock = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService) as any;
  });

  it('register forwards to service.register', async () => {
    service.register.mockResolvedValueOnce({ id: 1 } as any);
    const body = { email: 'a@a.com', password: 'x', name: 'A' };
    const res = await controller.register(body);
    expect(service.register).toHaveBeenCalledWith(body);
    expect(res).toEqual({ id: 1 });
  });

  it('login forwards req.user to service.login', () => {
    service.login.mockReturnValueOnce({ access_token: 't' } as any);
    // @ts-expect-error minimal req
    const res = controller.login({ user: { id: 2, email: 'b@b.com' } });
    expect(service.login).toHaveBeenCalledWith({ id: 2, email: 'b@b.com' });
    expect(res).toEqual({ access_token: 't' });
  });

  it('refresh forwards to service.refresh', () => {
    service.refresh.mockReturnValueOnce({ access_token: 'new' } as any);
    const res = controller.refresh({ refresh_token: 'r' });
    expect(service.refresh).toHaveBeenCalledWith('r');
    expect(res).toEqual({ access_token: 'new' });
  });
});
