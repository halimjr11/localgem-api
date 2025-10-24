import 'reflect-metadata';
import { ConfigService } from '@nestjs/config';

describe('AppModule TypeOrm forRootAsync factory', () => {
  it('useFactory returns expected TypeORM options', () => {
    const captured: { opts?: any } = {};

    jest.isolateModules(() => {
      jest.resetModules();
      jest.doMock('@nestjs/typeorm', () => ({
        TypeOrmModule: {
          forRootAsync: (opts: any) => {
            captured.opts = opts;
            return {} as any;
          },
          forFeature: jest.fn(),
        },
        InjectRepository: () => () => undefined,
      }));

      // Import after mocking to trigger decorator evaluation
      require('./app.module');
    });

    const useFactory: (cfg: ConfigService) => any = captured.opts.useFactory;
    const cfg = {
      get: (key: string) => ({
        'database.host': 'localhost',
        'database.port': 3306,
        'database.username': 'root',
        'database.password': '',
        'database.name': 'localgem',
      } as any)[key],
    } as unknown as ConfigService;

    const result = useFactory(cfg);
    expect(result).toMatchObject({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'localgem',
      synchronize: true,
    });
    expect(Array.isArray(result.entities)).toBe(true);
  });
});
