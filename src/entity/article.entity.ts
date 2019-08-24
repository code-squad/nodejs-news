import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationCount, UpdateDateColumn } from 'typeorm';
import { TypeUser } from './user.entity';

@Entity()
export class TypeArticle {
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

  @ManyToOne(type => TypeUser, {
    onUpdate: 'CASCADE'
  })
  @JoinColumn()
  writer : string;

  @ManyToMany(type => TypeUser, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({name: 'like_article'})
  likeUser : TypeUser[];

  @RelationCount((article: TypeArticle) => article.likeUser)
  likeUserCount : number;
}
