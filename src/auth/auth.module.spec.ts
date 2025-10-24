import 'reflect-metadata';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

// These are metadata-level tests to avoid spinning up a Nest container
// and external dependencies. They validate module structure.

describe('AuthModule (metadata)', () => {
  it('should define providers', () => {
    const providers: any[] = Reflect.getMetadata('providers', AuthModule) || [];
    expect(providers).toEqual(
      expect.arrayContaining([AuthService, JwtStrategy, LocalStrategy]),
    );
  });

  it('should export AuthService', () => {
    const exportsArr: any[] = Reflect.getMetadata('exports', AuthModule) || [];
    expect(exportsArr).toEqual(expect.arrayContaining([AuthService]));
  });

  it('should register expected imports and controllers', () => {
    const importsArr: any[] = Reflect.getMetadata('imports', AuthModule) || [];
    const controllers: any[] = Reflect.getMetadata('controllers', AuthModule) || [];

    // We can only reliably assert static class references here
    expect(importsArr).toEqual(expect.arrayContaining([UsersModule, PassportModule]));
    expect(controllers).toEqual(expect.arrayContaining([AuthController]));
  });
});
