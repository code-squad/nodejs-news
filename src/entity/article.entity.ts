import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationCount, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column()
  title : string;

  @Column()
  markdownKey : string;

  @Column()
  heroImageUrl : string;

  @Column({ default: 0 })
  hits : number;

  @CreateDateColumn()
  createdAt : Date;

  @UpdateDateColumn()
  modifiedAt : Date;

  @Column({ nullable: true, })
  deletedAt : Date;

  @ManyToOne(type => User, user => user.id, {
    onUpdate: 'CASCADE'
  })
  @JoinColumn()
  writer : User;

  @ManyToMany(type => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({name: 'like_article'})
  likeUser : User[];

  @RelationCount((article: Article) => article.likeUser)
  likeUserCount : number;
}
