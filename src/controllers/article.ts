import s3 from '../config/aws';
import converter from '../config/converter';
import Article, { IArticle } from '../models/article.model';
import { IUser } from '../models/user.model';
import { removeUndefinedFields } from '../util/fieldset';
import { S3_BUCKET } from '../util/secrets';

interface IArticleInfo {
  article : IArticle;
  rawHtml : string;
  writer  : {};
}

interface IPatchArticleInput {
  _id           : IArticle['_id'];
  title?        : IArticle['title'];
  markdownKey?  : IArticle['markdownKey'];
  heroImageUrl? : IArticle['heroImageUrl'];
}

interface IArticleLikeInput {
  articleId  : IArticle['_id'];
  likeUserId : IUser['_id'];
}

async function getRawArticleById(articleId: IArticle['_id']): Promise<IArticleInfo> {
  try {
    const article: IArticle = await Article.findOneAndUpdate(
      { _id: articleId, deletedAt: { $exists: false } },
      { $inc: { hits: 1 } },
      { new: true }
    ).populate('writerId');

    const articleRawHtml = await (s3.getObject({
      Bucket: S3_BUCKET,
      Key: article.markdownKey,
    }).promise());

    const rawMarkdown = await articleRawHtml.Body.toString('utf-8');

    return {
      article,
      rawHtml: converter.makeHtml(rawMarkdown),
      writer: article.writerId,
    };
  } catch (error) {
    throw error;
  }
}

async function createArticle({
  writerId,
  title,
  markdownKey,
  heroImageUrl,
}): Promise<{}> {
  try {
    return await Article.create({ writerId, title, markdownKey, heroImageUrl, createdAt: new Date(), hits: 0 });
  } catch (error) {
    throw error;
  }
}

async function getArticles(page = 1, pageSize = 8): Promise<IArticle[]> {
  try {
    return await Article.find(
      { deletedAt: { $exists: false } },
      undefined,
      { skip: (page - 1) * pageSize, limit: pageSize }
    ).sort('-createdAt')
      .populate('writerId');
  } catch (error) {
    throw error;
  }
}

async function getArticlesByUserId(userId: IUser['_id'], page: number, pageSize = 9): Promise<IArticle[]> {
  try {
    return await Article.find(
      { writerId: userId, deletedAt: { $exists: false } },
      undefined,
      { skip: (page - 1) * pageSize, limit: pageSize }).sort('-createdAt');
  } catch (error) {
    throw error;
  }
}

async function deleteArticle(articleId: IArticle['_id']): Promise<{}> {
  try {
    return await Article.updateOne({ _id: articleId }, { deletedAt: new Date() });
  } catch (error) {
    throw error;
  }
}

async function patchArticleById({
  _id,
  title,
  markdownKey,
  heroImageUrl,
}: IPatchArticleInput): Promise<{}> {
  try {
    const result = await Article.updateOne({
      _id,
      deletedAt: { $exists: false }
    }, removeUndefinedFields({title, markdownKey, heroImageUrl, modifiedAt: new Date() }));
    return result;
  } catch (error) {
    throw error;
  }
}

async function likeArticle({
  articleId,
  likeUserId,
}: IArticleLikeInput): Promise<void> {
  try {
    await Article.updateOne(
      { _id: articleId, deletedAt: { $exists: false } },
      { $addToSet: { likeUsers: likeUserId }}
    );
  } catch (error) {
    throw error;
  }
}

async function retractLikeArticle({
  articleId,
  likeUserId,
}: IArticleLikeInput): Promise<void> {
  try {
    await Article.updateOne(
      { _id: articleId, deletedAt: { $exists: false } },
      { $pull: { likeUsers: likeUserId }}
    );
  } catch (error) {
    throw error;
  }
}

async function checkLikeArticle({
  articleId,
  likeUserId,
}: IArticleLikeInput): Promise<boolean> {
  try {
    const result = await Article.findOne({
      _id: articleId,
      likeUsers: { $in: likeUserId },
      deletedAt: { $exists: false },
    });
    return result ? true : false;
  } catch (error) {
    throw error;
  }
}

export default {
  getRawArticleById,
  createArticle,
  getArticlesByUserId,
  getArticles,
  deleteArticle,
  patchArticleById,
  likeArticle,
  retractLikeArticle,
  checkLikeArticle,
};
