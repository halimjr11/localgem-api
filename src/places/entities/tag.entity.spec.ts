import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Tag } from './tag.entity';

describe('Tag entity', () => {
  it('generates slug from name (hooks)', () => {
    const t = new Tag() as any;
    t.name = 'Hello World! 2024';
    // call the private lifecycle method through bracket access
    t['setSlug']();
    expect(t.slug).toBe('hello-world-2024');
  });

  it('has unique constraints on name and slug', () => {
    const storage = getMetadataArgsStorage();
    const uniques = storage.uniques.filter(u => u.target === Tag);
    const columns = uniques.flatMap(u => (u.columns || []) as string[]);
    expect(columns).toEqual(expect.arrayContaining(['name', 'slug']));
  });
});
