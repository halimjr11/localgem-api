import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
  ) {}

  findAll(userId: number, tags?: string): Promise<Place[]> {
    if (!tags) {
      return this.placeRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
    }

    const slugs = tags
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    let qb = this.placeRepository
      .createQueryBuilder('place')
      .where('place.userId = :uid', { uid: userId })
      .orderBy('place.createdAt', 'DESC');

    slugs.forEach((slug, i) => {
      qb = qb.andWhere(
        `JSON_SEARCH(place.tagsSlugs, 'one', :slug${i}) IS NOT NULL`,
        { [`slug${i}`]: slug },
      );
    });

    return qb.getMany();
  }

  async findOne(id: number, userId: number): Promise<Place> {
    const place = await this.placeRepository.findOne({
      where: { id, user: { id: userId } },
    });
    return place ? Promise.resolve(place) : Promise.resolve({} as Place);
  }

  create(data: Partial<Place>, userId: number): Promise<Place> {
    const newPlace = this.placeRepository.create({
      ...data,
      user: { id: userId } as unknown as Place['user'],
    });
    return this.placeRepository.save(newPlace);
  }

  async update(
    id: number,
    data: Partial<Place>,
    userId: number,
  ): Promise<Place> {
    await this.placeRepository.update({ id, user: { id: userId } }, data);
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.placeRepository.delete({ id, user: { id: userId } });
  }
}
