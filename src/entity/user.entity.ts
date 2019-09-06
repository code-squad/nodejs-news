import bcrypt from 'bcrypt';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserPrivilege, UserStatus } from '../types/enums';

@Entity()
export class User {
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

  // @ManyToMany(type => User, User => User.subscribee, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // @JoinTable({name: 'subscription'})
  // subscriber! : User[];

  // @ManyToMany(type => User, User => User.subscriber, {
  //   onDelete: 'CASCADE',
  //   onUpdate: 'CASCADE',
  // })
  // subscribee! : User[];

  // @RelationCount((user: User) => user.subscriber)
  // subscriberCount : number;

  // @RelationCount((user: User) => user.subscribee)
  // subscribeeCount : number;

  constructor(constructorInput: IUserConstructor) {
    if (!constructorInput) return;
    this.email = constructorInput.email;
    this.password = constructorInput.password;
    this.privilege = constructorInput.privilege || UserPrivilege.WRITER;
    this.profileImageUrl = constructorInput.profileImageUrl;
    this.provider = constructorInput.provider || 'local';
    this.status = constructorInput.status || UserStatus.NORMAL;
  }
  comparePassword (candidatePassword: string, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch: boolean) => {
      callback(err, isMatch);
    });
  }
}


export interface IUserConstructor {
  email            : User['email'];
  password         : User['password'];
  privilege?       : User['privilege'];
  profileImageUrl? : User['profileImageUrl'];
  provider?        : User['provider'];
  status?          : User['status'];
}

@Entity()
export class Subscription {
  @ManyToOne(type => User, (user: User) => user.id, { primary: true })
  subscribee : User;

  @ManyToOne(type => User, (user: User) => user.id, { primary: true })
  subscriber : User;

  @CreateDateColumn()
  createdAt : Date;

  @UpdateDateColumn()
  modifiedAt : Date;

  @Column({ nullable: true, })
  deletedAt : Date;
}
