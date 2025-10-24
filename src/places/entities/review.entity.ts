import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Place } from './place.entity';

@Entity()
@Unique(['user', 'place'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user: User;

  @ManyToOne(() => Place, { nullable: false, onDelete: 'CASCADE' })
  place: Place;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
