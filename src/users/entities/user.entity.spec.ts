import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { User } from './user.entity';
import { Place } from '../../places/entities/place.entity';

describe('User entity metadata', () => {
  it('has OneToMany relation to Place on property "places"', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(r => r.target === User);
    const rel = relations.find(r => r.propertyName === 'places');
    const t = typeof rel?.type === 'function' ? (rel?.type as Function)() : rel?.type;
    expect(t).toBe(Place);
  });

  it('has unique email column', () => {
    const storage = getMetadataArgsStorage();
    const columns = storage.columns.filter(c => c.target === User);
    const email = columns.find(c => c.propertyName === 'email');
    expect(email?.options?.unique).toBe(true);
  });
});
