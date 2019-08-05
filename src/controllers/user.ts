import mongoose from 'mongoose';
import User, { IUser } from '../models/user.model';
import { UserPrivilege, UserStatus } from '../types/enums';
import { addHours } from '../util/datehelper';
import { removeUndefinedFields } from '../util/fieldset';
import logger from '../util/logger';

interface ICreateUserInput {
  email            : IUser['email'];
  password?        : IUser['password'];
  provider         : IUser['provider'];
  profileImageUrl? : IUser['profileImageUrl'];
}

interface IPatchUserInput {
  _id              : IUser['_id'];
  email?           : IUser['email'];
  password?        : IUser['password'];
  privilege?       : IUser['privilege'];
  profileImageUrl? : IUser['profileImageUrl'];
}

interface ISubscribeInput {
  subscriberId : IUser['_id'];
  writerId     : IUser['_id'];
}

async function CreateUser({
  email,
  password,
  provider = 'local',
  profileImageUrl,
}: ICreateUserInput): Promise<IUser> {
  try {
    const newUser = new User({
      email,
      password,
      privilege: UserPrivilege.WRITER,
      signUpDate: new Date(),
      status: UserStatus.NORMAL,
      provider,
      profileImageUrl,
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    throw error;
  }
}

async function GetUserById({
  _id,
}): Promise<IUser> {
  try {
    const user = await User.aggregate([
      { $match: {
          _id: mongoose.Types.ObjectId(_id),
          deletedAt: { $exists: false },
        }
      },
      { $project: {
        email           : true,
        privilege       : true,
        profileImageUrl : true,
        signUpDate      : true,
        status          : true,
        provider        : true,
        bannedExpires   : true,
        subscribers     : { $size: { $ifNull: [ '$subscribers', [] ] }},
        subscriptions   : { $size: { $ifNull: [ '$subscriptions', [] ] }},
      }},
    ]);

    return user[0];
  } catch (error) {
    throw error;
  }
}

async function GetUserByEmail(email): Promise<IUser> {
  try {
    const user: IUser = await User.findOne({ email,  deletedAt: { $exists: false } }, '-password');
    return user;
  } catch (error) {
    throw error;
  }
}

async function DeleteUserById({
  _id,
}): Promise<{}> {
  try {
    const result: {} = await User.updateOne({ _id, deletedAt: { $exists: false } }, { deletedAt: new Date() });
    return result;
  } catch (error) {
    throw error;
  }
}

async function PatchUserById({
  _id,
  email,
  password,
  privilege,
  profileImageUrl,
}: IPatchUserInput): Promise<any> {
  try {
    const result = await User.updateOne({
      _id,
      deletedAt: { $exists: false }
    }, removeUndefinedFields({email, password, privilege, profileImageUrl}));
    return result;
  } catch (error) {
    throw error;
  }
}

async function checkSubscribed(userId: IUser['_id'], writerId: IUser['_id']) {
  try {
    const result = await User.findOne({
      _id: userId,
      subscriptions: { $in: writerId },
      deletedAt: { $exists: false },
    });

    return result ? true : false;
  } catch (error) {
    throw error;
  }
}

async function subscribeUser({subscriberId, writerId}: ISubscribeInput): Promise<any> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await User.updateOne(
      { _id: subscriberId, deletedAt: { $exists: false } },
      { $addToSet: { subscriptions: writerId }}
    );

    await User.updateOne(
      { _id: writerId, deletedAt: { $exists: false } },
      { $addToSet: { subscribers: subscriberId }}
    );

    session.commitTransaction();
  } catch (error) {
    logger.error(`A serious error occurred while performing the subscription operation!!
      Error message: ${error.message},
      Stacktrace: ${error.stack}
    `);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function unsubscribeUser({subscriberId, writerId}: ISubscribeInput): Promise<any> {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await User.updateOne(
      { _id: subscriberId, deletedAt: { $exists: false } },
      { $pull: { subscriptions: writerId }}
    );

    await User.updateOne(
      { _id: writerId, deletedAt: { $exists: false } },
      { $pull: { subscribers: subscriberId }}
    );

    session.commitTransaction();
  } catch (error) {
    logger.error(`A serious error occurred while performing the unsubscription operation!!
      Error message: ${error.message},
      Stacktrace: ${error.stack}
    `);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function banUser({
  _id,
  isTemporarily,
  hours,
}) {
  try {
    const modifyFieldSet = isTemporarily ? {
      status: UserStatus.BANNED_TEMPORARILY,
      bannedExpires: addHours(hours),
    } : {
      status: UserStatus.BANNED_FOREVER,
    };
    const result = await User.updateOne(
      { _id, deletedAt: { $exists: false }},
      modifyFieldSet,
    );

    return result;
  } catch (error) {
    throw error;
  }
}

export default {
  CreateUser,
  DeleteUserById,
  GetUserById,
  GetUserByEmail,
  PatchUserById,
  banUser,
  subscribeUser,
  unsubscribeUser,
  checkSubscribed,
};
