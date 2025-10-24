import 'reflect-metadata';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';

describe('AuthModule JwtModule.registerAsync factory', () => {
  it('useFactory returns jwt config based on ConfigService', () => {
    const imports: any[] = Reflect.getMetadata('imports', AuthModule) || [];

    const dynWithFactory = imports.find((im: any) => Array.isArray(im?.providers) && im.providers.some((p: any) => typeof p?.useFactory === 'function'));
    expect(dynWithFactory).toBeDefined();

    const providerWithFactory = dynWithFactory.providers.find((p: any) => typeof p?.useFactory === 'function');
    const useFactory: (cfg: ConfigService) => any = providerWithFactory.useFactory;

    const cfg = {
      get: (key: string) => {
        const map: Record<string, any> = {
          'jwt.secret': 's',
          'jwt.expiresIn': 123,
        };
        return map[key];
      },
    } as unknown as ConfigService;

    const result = useFactory(cfg);
    expect(result).toMatchObject({
      secret: 's',
      signOptions: { expiresIn: 123 },
    });
  });
});
