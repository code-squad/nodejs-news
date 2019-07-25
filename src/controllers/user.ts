import User, { IUser, IUserForClient } from '../models/user.model';
import { UserPrivilege, UserStatus } from '../types/enums';
import { addHours } from '../util/datehelper';
import { removeUndefinedFields } from '../util/fieldset';

interface ICreateUserInput {
  email    : IUser['email'];
  password : IUser['password'];
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
}: ICreateUserInput): Promise<IUser> {
  try {
    const data: IUser = await User.create({
      email,
      password,
      privilege: UserPrivilege.USER,
      signUpDate: new Date(),
      status: UserStatus.NORMAL,
    });
    return data;
  } catch (error) {
    throw error;
  }
}

async function GetUserById({
  _id,
}): Promise<IUserForClient> {
  try {
    const user: IUserForClient = await User.findOne({ _id,  deletedAt: { $exists: false } }, '-password');
    return user;
  } catch (error) {
    throw error;
  }
}

async function GetUserByEmail(email): Promise<IUserForClient> {
  try {
    const user: IUserForClient = await User.findOne({ email,  deletedAt: { $exists: false } }, '-password');
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
    console.log(_id, profileImageUrl);
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
