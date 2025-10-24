import 'reflect-metadata';
import { AppModule } from './app.module';

describe('AppModule (load coverage)', () => {
  it('should load module definition', () => {
    expect(AppModule).toBeDefined();
  });
});
