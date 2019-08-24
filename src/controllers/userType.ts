import { getConnection } from 'typeorm';
import { Subscription, TypeUser } from '../entity/user.entity';
import { UserPrivilege, UserStatus } from '../types/enums';
import { removeUndefinedFields } from '../util/fieldset';

interface ICreateUserInput {
  email            : TypeUser['email'];
  password?        : TypeUser['password'];
  provider         : TypeUser['provider'];
  profileImageUrl? : TypeUser['profileImageUrl'];
}

interface IPatchUserInput {
  id              : TypeUser['id'];
  email?           : TypeUser['email'];
  password?        : TypeUser['password'];
  privilege?       : TypeUser['privilege'];
  profileImageUrl? : TypeUser['profileImageUrl'];
}

export interface IUserInformation extends TypeUser {
  subscriberSize : number;
}

async function createUser({
  email,
  password,
  provider = 'local',
  profileImageUrl,
}: ICreateUserInput): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(TypeUser)
      .values([
        {
          email,
          password,
          privilege: UserPrivilege.WRITER,
          signUpDate: new Date(),
          status: UserStatus.NORMAL,
          provider,
          profileImageUrl,
        }
      ])
      .execute();
  } catch (error) {
    throw error;
  }
}

async function deleteUserById(id: TypeUser['id']): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .update(TypeUser)
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

async function getUserById(id: TypeUser['id']): Promise<TypeUser> {
  try {
    const connection = getConnection();
    const user = await connection
      .getRepository(TypeUser)
      .createQueryBuilder('user')
      .where('user.id = :id', { id, })
      .andWhere('user.deletedAt is null')
      .getOne();

    /*
    * Subscription 테이블의 별명을 sub로 지정
    * 사용할 외래키는 subscribee
    * subscribee가 parameter로 주어진 id와 같은 것만 고름
    */
    const subscriberSize = await connection
      .getRepository(Subscription)
      .createQueryBuilder('sub')
      .innerJoinAndSelect(
        'sub.subscribee',
        'user',
        'sub.subscribee = :id', { id, }
      )
      .getCount();

    const returnValue: IUserInformation = {
      ...user,
      subscriberSize,
    };

    return returnValue;
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email: TypeUser['email']) {
  try {
    return await getConnection()
      .getRepository(TypeUser)
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
      .update(TypeUser)
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
}): Promise<Subscription> {
  try {
    const subscription = await getConnection()
      .createQueryBuilder()
      .select('sub')
      .from(Subscription, 'sub')
      .where(
        'sub.subscribee = :subscribeeId and sub.subscriber = :subscriberId',
        { subscribeeId, subscriberId }
      )
      .getOne();
    return subscription;
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

async function getSubscriptions(userId: TypeUser['id'], page = 0, pageSize = 10) {
  try {
    return await getConnection()
    .getRepository(Subscription)
    .createQueryBuilder('sub')
    .innerJoinAndSelect(
      'sub.subscriber',
      'user',
      'sub.subscribee = :id', { id: userId, }
    )
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
  checkSubscribed,
  subscribeUser,
  unsubscribeUser,
  getSubscriptions,
};
