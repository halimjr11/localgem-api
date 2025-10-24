import 'reflect-metadata';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

describe('main bootstrap', () => {
  const listen = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.resetModules();
    listen.mockReset();
    (require('@nestjs/core').NestFactory.create as jest.Mock).mockResolvedValue({
      listen,
    });
  });

  it('boots with default port when PORT not set', async () => {
    const prev = process.env.PORT;
    delete process.env.PORT;

    await new Promise<void>((resolve) => {
      jest.isolateModules(() => {
        require('./main');
        resolve();
      });
    });

    // allow microtasks to flush
    await Promise.resolve();

    expect(require('@nestjs/core').NestFactory.create).toHaveBeenCalled();
    expect(listen).toHaveBeenCalledWith(3000);

    if (prev !== undefined) process.env.PORT = prev;
  });

  it('boots with env PORT', async () => {
    jest.resetModules();
    (require('@nestjs/core').NestFactory.create as jest.Mock).mockResolvedValue({ listen });

    process.env.PORT = '4321';
    await new Promise<void>((resolve) => {
      jest.isolateModules(() => {
        require('./main');
        resolve();
      });
    });
    await Promise.resolve();
    expect(listen).toHaveBeenCalledWith('4321');
  });
});
