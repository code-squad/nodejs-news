import Showdown from 'showdown';
import s3 from '../config/aws';
import Article, { IArticle } from '../models/article.model';
import { S3_BUCKET } from '../util/secrets';

const converter = new Showdown.Converter();
converter.setFlavor('github');
converter.setOption('tasklists', true);
converter.setOption('emoji', true);

interface IArticleInfo {
  title   : IArticle['title'];
  rawHtml : string;
}

async function getRawArticleById(articleId): Promise<IArticleInfo> {
  try {
    const article: IArticle = await Article.findOne({ _id: articleId, deletedAt: { $exists: false } });

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

export default {
  getRawArticleById,
};
