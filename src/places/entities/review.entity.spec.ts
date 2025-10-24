import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';
import { Place } from './place.entity';

describe('Review entity metadata', () => {
  it('has @Entity and unique constraint on [user, place]', () => {
    const storage = getMetadataArgsStorage();
    const entity = storage.tables.find(t => t.target === Review);
    expect(entity).toBeDefined();

    const uniques = storage.uniques.filter(u => u.target === Review);
    const cols = uniques.flatMap(u => (u.columns || []) as string[]);
    expect(cols).toEqual(expect.arrayContaining(['user', 'place']));
  });

  it('has relations to User and Place with correct options', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(r => r.target === Review);

    const userRel = relations.find(r => r.propertyName === 'user');
    const userType = typeof userRel?.type === 'function' ? (userRel?.type as Function)() : userRel?.type;
    expect(userType).toBe(User);
    expect(userRel?.options?.nullable).toBe(false);

    const placeRel = relations.find(r => r.propertyName === 'place');
    const placeType = typeof placeRel?.type === 'function' ? (placeRel?.type as Function)() : placeRel?.type;
    expect(placeType).toBe(Place);
    expect(placeRel?.options?.nullable).toBe(false);
    expect(placeRel?.options?.onDelete).toBe('CASCADE');
  });

  it('has rating and comment columns with expected types', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter(c => c.target === Review);

    const rating = columns.find(c => c.propertyName === 'rating');
    expect(rating?.options?.type).toBe('int');

    const comment = columns.find(c => c.propertyName === 'comment');
    expect(comment?.options?.type).toBe('text');
    expect(comment?.options?.nullable).toBe(true);
  });
});
