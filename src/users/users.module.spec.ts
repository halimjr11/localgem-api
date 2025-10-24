import 'reflect-metadata';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UsersModule (metadata)', () => {
  it('should provide and export UsersService', () => {
    const providers: any[] = Reflect.getMetadata('providers', UsersModule) || [];
    const exportsArr: any[] = Reflect.getMetadata('exports', UsersModule) || [];

    expect(providers).toEqual(expect.arrayContaining([UsersService]));
    expect(exportsArr).toEqual(expect.arrayContaining([UsersService]));
  });
});
