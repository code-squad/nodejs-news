import s3 from '../config/aws';
import converter from '../config/converter';
import Article, { IArticle } from '../models/article.model';
import { S3_BUCKET } from '../util/secrets';

interface IArticleInfo {
  title   : IArticle['title'];
  rawHtml : string;
}

async function getRawArticleById(articleId): Promise<IArticleInfo> {
  try {
    const article: IArticle = await Article.findOneAndUpdate(
      { _id: articleId, deletedAt: { $exists: false } },
      { $inc: { hits: 1 } },
      { new: true }
    );

    const articleRawHtml = await s3.getObject({
      Bucket: S3_BUCKET,
      Key: article.markdownKey,
    }).promise();

    const rawMarkdown = await articleRawHtml.Body.toString('utf-8');

    return {
      title: article.title,
      rawHtml: converter.makeHtml(rawMarkdown),
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

export default {
  getRawArticleById,
  createArticle,
};
