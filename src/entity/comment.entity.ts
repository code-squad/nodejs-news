import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, RelationCount, Tree, TreeChildren, TreeParent, UpdateDateColumn } from 'typeorm';
import { TypeArticle } from './article.entity';
import { TypeUser } from './user.entity';

@Entity()
@Tree('closure-table')
export class TypeComment {
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

  @ManyToOne(type => TypeUser, { onUpdate: 'CASCADE' })
  @JoinColumn()
  writer : string;

  @ManyToOne(type => TypeArticle, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn()
  article : string;

  @ManyToMany(type => TypeUser, { onUpdate: 'CASCADE', onDelete: 'CASCADE'})
  @JoinTable({name: 'like_comment'})
  likeUser : TypeUser[];

  @RelationCount((comment: TypeComment) => comment.likeUser)
  likeUserCount : number;

  @TreeChildren()
  children : TypeComment[];

  @TreeParent()
  parent : TypeComment;
}

