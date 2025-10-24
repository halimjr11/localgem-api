import 'reflect-metadata';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  it('should be defined', () => {
    const guard = new LocalAuthGuard();
    expect(guard).toBeDefined();
  });

  it('should expose canActivate method from AuthGuard', () => {
    const guard = new LocalAuthGuard() as any;
    expect(typeof guard.canActivate).toBe('function');
  });
});
