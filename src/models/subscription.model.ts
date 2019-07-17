import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface ISubscription extends Document {
  followId  : IUser['_id'];
  userId    : IUser['_id'];
  deletedAt : Date;
}

const subscriptionSchema: Schema = new Schema({
  followId  : { type: Schema.Types.ObjectId, required: true},
  userId    : { type: Schema.Types.ObjectId, required: true },
  deletedAt : { type: Schema.Types.Date },
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);
