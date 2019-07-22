import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

export interface IArticle extends Document {
  _id         : Schema.Types.ObjectId;
  title       : string;
  markdownKey : string;
  writerId    : IUser['_id'];
  hits        : number;
  createdAt   : Date;
  modifiedAt  : Date;
  deletedAt   : Date;
}

const articleSchema: Schema = new Schema({
  title       : { type: Schema.Types.String, required: true },
  markdownKey : { type: Schema.Types.String, required: true },
  writerId    : { type: Schema.Types.ObjectId, required: true },
  hits        : { type: Schema.Types.Number, required: true },
  createdAt   : { type: Schema.Types.Date, required: true },
  modifiedAt  : { type: Schema.Types.Date },
  deletedAt   : { type: Schema.Types.Date },
});

export default mongoose.model<IArticle>('Article', articleSchema, 'articles');
