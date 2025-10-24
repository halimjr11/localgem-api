import 'reflect-metadata';
import { PlacesModule } from './places.module';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

describe('PlacesModule (metadata)', () => {
  it('defines controller and provider', () => {
    const controllers: any[] = Reflect.getMetadata('controllers', PlacesModule) || [];
    const providers: any[] = Reflect.getMetadata('providers', PlacesModule) || [];

    expect(controllers).toEqual(expect.arrayContaining([PlacesController]));
    expect(providers).toEqual(expect.arrayContaining([PlacesService]));
  });
});
