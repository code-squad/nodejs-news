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
  email?           : string;
  password?        : string;
  privilege?       : number;
  profileImageUrl? : string;
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

async function GetUserByObjectId({
  _id,
}): Promise<IUserForClient> {
  try {
    const user: IUserForClient = await User.findById({ _id });
    return user;
  } catch (error) {
    throw error;
  }
}

async function GetUserByQuery(query): Promise<IUserForClient> {
  try {
    const user: IUserForClient = await User.findOne(query);
    return user;
  } catch (error) {
    throw error;
  }
}

async function DeleteUserByObjectId({
  _id,
}): Promise<{}> {
  try {
    const result: {} = await User.deleteOne({ _id });
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
    const result = await User.updateOne({ _id }, removeUndefinedFields({email, password, privilege, profileImageUrl}));
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
      { _id },
      modifyFieldSet,
    );

    return result;
  } catch (error) {
    throw error;
  }
}

export default {
  CreateUser,
  DeleteUserByObjectId,
  GetUserByObjectId,
  GetUserByQuery,
  PatchUserById,
  banUser,
};
