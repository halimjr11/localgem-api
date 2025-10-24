import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from './places.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Place } from './entities/place.entity';

describe('PlacesService', () => {
  let service: PlacesService;
  let repo: any;

  beforeEach(async () => {
    const repositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesService,
        {
          provide: getRepositoryToken(Place),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<PlacesService>(PlacesService);
    repo = module.get(getRepositoryToken(Place));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll without tags uses repository.find with user filter and order', async () => {
    const userId = 1;
    const places = [{ id: 1 }, { id: 2 }] as Place[];
    repo.find.mockResolvedValueOnce(places);

    const result = await service.findAll(userId);

    expect(repo.find).toHaveBeenCalledWith({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(places);
  });

  it('findAll with tags builds JSON_SEARCH conditions and returns getMany', async () => {
    const userId = 2;
    const qbChain = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([{ id: 10 }] as Place[]),
    };
    repo.createQueryBuilder.mockReturnValue(qbChain);

    const result = await service.findAll(userId, 'coffee,cozy');

    expect(repo.createQueryBuilder).toHaveBeenCalledWith('place');
    expect(qbChain.where).toHaveBeenCalledWith('place.userId = :uid', {
      uid: userId,
    });
    expect(qbChain.orderBy).toHaveBeenCalledWith('place.createdAt', 'DESC');
    // ensure two JSON_SEARCH conditions appended
    expect(qbChain.andWhere).toHaveBeenCalledTimes(2);
    expect(qbChain.getMany).toHaveBeenCalled();
    expect(result).toEqual([{ id: 10 }]);
  });

  it('findOne returns entity when found', async () => {
    const place = { id: 3 } as Place;
    repo.findOne.mockResolvedValueOnce(place);
    const res = await service.findOne(3, 4);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 3, user: { id: 4 } } });
    expect(res).toBe(place);
  });

  it('findOne returns empty object when not found', async () => {
    repo.findOne.mockResolvedValueOnce(null);
    const res = await service.findOne(5, 6);
    expect(res).toEqual({} as Place);
  });

  it('create constructs entity with user id and saves it', async () => {
    const data = { name: 'X' } as Partial<Place>;
    const created = { id: 7 } as Place;
    repo.create.mockReturnValueOnce(created);
    repo.save.mockResolvedValueOnce(created);
    const res = await service.create(data, 8);
    expect(repo.create).toHaveBeenCalledWith({ ...data, user: { id: 8 } });
    expect(repo.save).toHaveBeenCalledWith(created);
    expect(res).toBe(created);
  });

  it('update performs update and returns findOne result', async () => {
    repo.update.mockResolvedValueOnce(undefined);
    jest.spyOn(service, 'findOne').mockResolvedValueOnce({ id: 9 } as Place);
    const res = await service.update(9, { name: 'Y' }, 10);
    expect(repo.update).toHaveBeenCalledWith({ id: 9, user: { id: 10 } }, { name: 'Y' });
    expect(service.findOne).toHaveBeenCalledWith(9, 10);
    expect(res).toEqual({ id: 9 });
  });

  it('remove deletes by id and userId', async () => {
    repo.delete.mockResolvedValueOnce(undefined);
    await service.remove(11, 12);
    expect(repo.delete).toHaveBeenCalledWith({ id: 11, user: { id: 12 } });
  });
});
