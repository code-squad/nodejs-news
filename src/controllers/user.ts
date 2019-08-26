import { getConnection, getManager } from 'typeorm';
import { Subscription, User } from '../entity/user.entity';
import { removeUndefinedFields } from '../util/fieldset';

interface ICreateUserInput {
  email            : User['email'];
  password?        : User['password'];
  provider         : User['provider'];
  profileImageUrl? : User['profileImageUrl'];
}

interface IPatchUserInput {
  id              : User['id'];
  email?           : User['email'];
  password?        : User['password'];
  privilege?       : User['privilege'];
  profileImageUrl? : User['profileImageUrl'];
}

export interface IUserInformation extends User {
  subscriberSize : number;
}

async function createUser({
  email,
  password,
  provider = 'local',
  profileImageUrl,
}: ICreateUserInput): Promise<User> {
  try {
    const newUser = new User({
      email, password, provider, profileImageUrl,
    });
    await getManager().save(newUser);

    return newUser;
  } catch (error) {
    throw error;
  }
}

async function deleteUserById(id: User['id']): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        deletedAt: new Date(),
      })
      .where(
        'id = :id', { id, }
      )
      .execute();
  } catch (error) {
    throw error;
  }
}

async function getUserById(id: User['id']): Promise<{ user : User, subscriberCount : number}> {
  try {
    const connection = getConnection();
    const user = await connection
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :id', { id, })
      .andWhere('user.deletedAt is null')
      .getOne();

    /*
    * Subscription 테이블의 별명을 sub로 지정
    * 사용할 외래키는 subscribee
    * subscribee가 parameter로 주어진 id와 같은 것만 고름
    */
    const subscriberCount = await connection
      .getRepository(Subscription)
      .createQueryBuilder('sub')
      .innerJoinAndSelect(
        'sub.subscribee',
        'user',
        'sub.subscribee = :id', { id, }
      )
      .getCount();

    return { user, subscriberCount };
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email: User['email']) {
  try {
    return await getConnection()
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.email = :email', { email, })
      .getOne();
  } catch (error) {
    throw error;
  }
}

async function patchUserById(updateValues: IPatchUserInput): Promise<void> {
  try {
    const id = updateValues.id;
    const refinedUpdateValues = removeUndefinedFields(updateValues);
    // tslint:disable-next-line: no-string-literal
    delete refinedUpdateValues['id'];

    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set(refinedUpdateValues)
      .where('id = :id', {id, })
      .execute();

  } catch (error) {
    throw error;
  }
}

async function checkSubscribed({
  subscriberId,
  subscribeeId,
}): Promise<boolean> {
  try {
    const subscription = await getConnection()
      .getRepository(Subscription)
      .createQueryBuilder('sub')
      .where('sub.subscribeeId = :subscribeeId', { subscribeeId, })
      .andWhere('sub.subscriberId = :subscriberId', { subscriberId, })
      .getOne();
    return subscription ? true : false;
  } catch (error) {
    throw error;
  }
}

async function subscribeUser({
  subscriberId,
  writerId,
}) {
  try {
    const connection = getConnection();

    const subscription = await connection
      .getRepository(Subscription)
      .createQueryBuilder('sub')
      .where('sub.subscribee = :subscribeeId and sub.subscriber = :subscriberId', {
        subscriberId,
        subscribeeId: writerId,
      })
      .getOne();

    if (!subscription) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(Subscription)
        .values({
          subscriber: subscriberId,
          subscribee: writerId,
        })
        .execute();
    } else {
      await connection
        .createQueryBuilder()
        .update(Subscription)
        .set({
          deletedAt: undefined,
        })
        .where('subscribee = :subscribeeId and subscriber = :subscriberId', {
          subscriberId,
          subscribeeId: writerId,
        })
        .execute();
    }
  } catch (error) {
    throw error;
  }
}

async function unsubscribeUser({
  subscriberId,
  writerId,
}) {
  try {
    const connection = getConnection();
    await connection
      .createQueryBuilder()
      .update(Subscription)
      .set({
        deletedAt: new Date()
      })
      .where('subscriber = :subscriberId and subscribee = :subscribeeId', {
        subscriberId,
        subscribeeId: writerId,
      })
      .execute();
  } catch (error) {
    throw error;
  }
}

async function getSubscriptions(userId: User['id'], page = 0, pageSize = 10) {
  try {
    return await getConnection()
    .getRepository(Subscription)
    .createQueryBuilder('sub')
    .innerJoinAndSelect(
      'sub.subscribee',
      'user',
    )
    .where('sub.subscriber = :id', { id: userId, })
    .orderBy('sub.createdAt', 'DESC')
    .skip(page * pageSize)
    .take(pageSize)
    .getMany();
  } catch (error) {
    throw error;
  }
}

export default {
  createUser,
  deleteUserById,
  getUserById,
  patchUserById,
  getUserByEmail,
  checkSubscribed,
  subscribeUser,
  unsubscribeUser,
  getSubscriptions,
};
