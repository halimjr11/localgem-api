import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;

  beforeEach(async () => {
    const repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repositoryMock },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('findByEmail returns user or null', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 1 });
    await expect(service.findByEmail('a@a.com')).resolves.toEqual({ id: 1 });
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findByEmail('b@b.com')).resolves.toBeNull();
  });

  it('create creates and saves user', async () => {
    repo.create.mockReturnValue({ id: 2 });
    repo.save.mockResolvedValue({ id: 2 });
    const res = await service.create({ email: 'a', password: 'p' });
    expect(repo.create).toHaveBeenCalledWith({ email: 'a', password: 'p' });
    expect(repo.save).toHaveBeenCalledWith({ id: 2 });
    expect(res).toEqual({ id: 2 });
  });

  it('findOne returns user or throws NotFoundException', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 3 });
    await expect(service.findOne(3)).resolves.toEqual({ id: 3 });
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
