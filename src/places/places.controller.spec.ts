import { Test, TestingModule } from '@nestjs/testing';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';

describe('PlacesController', () => {
  let controller: PlacesController;
  let service: any;

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlacesController],
      providers: [
        {
          provide: PlacesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<PlacesController>(PlacesController);
    service = module.get(PlacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward to service.findAll when called (smoke test)', async () => {
    service.findAll.mockResolvedValueOnce([]);
    // @ts-expect-error: constructing minimal req object for test
    await controller.findAll({ user: { id: 1 } }, undefined);
    expect(service.findAll).toHaveBeenCalledWith(1, undefined);
  });

  it('findOne forwards id and user.id', async () => {
    service.findOne.mockResolvedValueOnce({ id: 1 });
    // @ts-expect-error minimal req
    const res = await controller.findOne('3', { user: { id: 2 } });
    expect(service.findOne).toHaveBeenCalledWith(3, 2);
    expect(res).toEqual({ id: 1 });
  });

  it('create forwards body and user.id', async () => {
    service.create.mockResolvedValueOnce({ id: 5 });
    // @ts-expect-error minimal req
    const res = await controller.create({ name: 'A' } as any, { user: { id: 7 } });
    expect(service.create).toHaveBeenCalledWith({ name: 'A' }, 7);
    expect(res).toEqual({ id: 5 });
  });

  it('update forwards id, body, and user.id', async () => {
    service.update.mockResolvedValueOnce({ id: 9 });
    // @ts-expect-error minimal req
    const res = await controller.update('11', { name: 'B' } as any, { user: { id: 13 } });
    expect(service.update).toHaveBeenCalledWith(11, { name: 'B' }, 13);
    expect(res).toEqual({ id: 9 });
  });
});
