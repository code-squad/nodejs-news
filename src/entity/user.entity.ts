import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class TypeUser {
  @PrimaryGeneratedColumn('uuid')
  id : string;

  @Column({ unique: true })
  email : string;

  @Column({ nullable: true })
  password : string;

  @Column({ type: 'tinyint' })
  privilege : number;

  @Column({ nullable: true, })
  profileImageUrl : string;

  @Column({ nullable: true, })
  provider : string;

  @CreateDateColumn()
  signUpDate : Date;

  @Column({ type: 'tinyint' })
  status : number;

  @Column({ nullable: true, })
  bannedExpires : Date;

  @UpdateDateColumn()
  modifiedAt : Date;

  @Column({ nullable: true, })
  deletedAt : Date;

  // @ManyToMany(type => TypeUser, typeUser => typeUser.subscribee, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinTable({name: 'subscription'})
  // subscriber! : TypeUser[];

  // @ManyToMany(type => TypeUser, typeUser => typeUser.subscriber, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // subscribee! : TypeUser[];

  // @RelationCount((user: TypeUser) => user.subscriber)
  // subscriberCount : number;

  // @RelationCount((user: TypeUser) => user.subscribee)
  // subscribeeCount : number;
}

@Entity()
export class Subscription {
  @ManyToOne(type => TypeUser, (user: TypeUser) => user.id, { primary: true })
  subscribee : TypeUser;

  @ManyToOne(type => TypeUser, (user: TypeUser) => user.id, { primary: true })
  subscriber : TypeUser;

  @CreateDateColumn()
  createdAt : Date;

  @UpdateDateColumn()
  modifiedAt : Date;

  @Column({ nullable: true, })
  deletedAt : Date;
}
