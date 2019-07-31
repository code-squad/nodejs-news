import bcrypt from 'bcrypt';
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id             : Schema.Types.ObjectId;
  email           : string;
  password        : string;
  privilege       : number;
  profileImageUrl : string;
  signUpDate      : Date;
  status          : number;
  bannedExpires   : Date;
  deletedAt       : Date;
}

export interface IUserForClient extends Document {
  _id             : IUser['_id'];
  email           : IUser['email'];
  privilege       : IUser['privilege'];
  profileImageUrl : IUser['profileImageUrl'];
}

const UserSchema: Schema = new Schema({
  email           : { type: String, required: true, unique: true },
  password        : { type: String, required: true },
  privilege       : { type: Number, required: true },
  profileImageUrl : { type: String },
  signUpDate      : { type: Date, required: true },
  status          : { type: Number, required: true },
  bannedExpires   : { type: Date },
  deletedAt       : { type: Date },
});

export interface IUserScheme extends IUser {
  comparePassword(candidatePassword: IUser['password'], callback: (err: mongoose.Error, isMatch: boolean) => void);
}

const comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

UserSchema.methods.comparePassword = comparePassword;


export default mongoose.model<IUser>('User', UserSchema);
