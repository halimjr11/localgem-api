import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Place } from './place.entity';
import { User } from '../../users/entities/user.entity';

describe('Place entity metadata', () => {
  it('has ManyToOne relation to User with nullable:false', () => {
    const storage = getMetadataArgsStorage();
    const relations = storage.relations.filter(r => r.target === Place);
    const rel = relations.find(r => r.propertyName === 'user');
    const t = typeof rel?.type === 'function' ? (rel?.type as Function)() : rel?.type;
    expect(t).toBe(User);
    expect(rel?.options?.nullable).toBe(false);
  });
});
