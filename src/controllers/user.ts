import User, { IUser } from '../models/user.model';
import { UserPrivilege, UserStatus } from '../types/enums';
import { addHours } from '../util/datehelper';
import { removeUndefinedFields } from '../util/fieldset';

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
    const user: IUser = await User.findOne({ _id,  deletedAt: { $exists: false } }, '-password');
    return user;
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
};
