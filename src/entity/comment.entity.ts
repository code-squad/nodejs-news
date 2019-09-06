import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationCount, Tree, TreeChildren, TreeParent, UpdateDateColumn } from 'typeorm';
import { Article } from './article.entity';
import { User } from './user.entity';


@Entity()
@Tree('closure-table')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({ type: 'text' })
  content : string;

  @CreateDateColumn()
  createdAt : Date;

  @UpdateDateColumn()
  modifiedAt : Date;

  @Column({ nullable: true, })
  deletedAt : Date;

  @ManyToOne(type => User, { onUpdate: 'CASCADE' })
  @JoinColumn()
  writer : User;

  @ManyToOne(type => Article, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn()
  article : Article;

  @ManyToMany(type => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  @JoinTable({name: 'like_comment'})
  likeUser : User[];

  @RelationCount((comment: Comment) => comment.likeUser)
  likeUserCount : number;

  @TreeChildren()
  children : Comment[];

  @TreeParent()
  parent : Comment;
}

