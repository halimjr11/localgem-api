import 'reflect-metadata';
import config from './configuration';

describe('configuration factory', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns defaults when env not set', () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_REFRESH_EXPIRES_IN;

    const cfg = config();
    expect(cfg.database).toEqual({
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      name: 'localgem',
    });
    expect(cfg.jwt).toEqual({
      secret: 'your-secret-key',
      expiresIn: 900,
      refreshSecret: 'your-refresh-secret-key',
      refreshExpiresIn: 604800,
    });
  });

  it('parses numeric envs', () => {
    process.env.DB_PORT = '5432';
    process.env.JWT_EXPIRES_IN = '1200';
    process.env.JWT_REFRESH_EXPIRES_IN = '100';

    const cfg = config();
    expect(cfg.database.port).toBe(5432);
    expect(cfg.jwt.expiresIn).toBe(1200);
    expect(cfg.jwt.refreshExpiresIn).toBe(100);
  });
});
