import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id             : Schema.Types.ObjectId;
  email           : string;
  password        : string;
  privilege       : number;
  profileImageUrl : string;
  provider        : string;
  signUpDate      : Date;
  status          : number;
  bannedExpires   : Date;
  deletedAt       : Date;
  subscribers     : [Schema.Types.ObjectId];
  subscriptions   : [Schema.Types.ObjectId];
}

const UserSchema: Schema = new Schema({
  email           : { type: String, required: true, unique: true },
  password        : { type: String },
  privilege       : { type: Number, required: true },
  profileImageUrl : { type: String },
  signUpDate      : { type: Date, required: true },
  status          : { type: Number, required: true },
  provider        : { type: String, required: true },
  bannedExpires   : { type: Date },
  deletedAt       : { type: Date },
  subscribers     : { type: Array, default: [], ref: 'User' },
  subscriptions   : { type: Array, default: [], ref: 'User'},
});

<<<<<<< HEAD
export interface IUserScheme extends IUser {
  comparePassword(
    candidatePassword: IUser['password'],
    callback: (err: mongoose.Error, isMatch: boolean) => void
  );
}

||||||| merged common ancestors
=======
export interface IUserScheme extends IUser {
  comparePassword(candidatePassword: IUser['password'], callback: (err: mongoose.Error, isMatch: boolean) => void);
}

>>>>>>> refactor: Local 로그인 인증 방식 변경
const comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

UserSchema.methods.comparePassword = comparePassword;

export default mongoose.model<IUser>('User', UserSchema);
