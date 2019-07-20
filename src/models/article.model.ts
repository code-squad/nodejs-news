import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IArticle extends Document {
  _id         : Schema.Types.ObjectId;
  title       : string;
  markdownKey : string;
  writerId    : IUser['_id'];
  modifiedAt  : Date;
  deletedAt   : Date;
}

const articleSchema: Schema = new Schema({
  title       : { type: Schema.Types.String, required: true },
  markdownKey : { type: Schema.Types.String, required: true },
  userId      : { type: Schema.Types.ObjectId, required: true },
  modifiedAt  : { type: Schema.Types.Date },
  deletedAt   : { type: Schema.Types.Date },
});

export default mongoose.model<IArticle>('Article', articleSchema, 'articles');
