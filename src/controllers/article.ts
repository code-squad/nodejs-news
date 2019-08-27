import { getConnection } from 'typeorm';
import s3 from '../config/aws';
import converter from '../config/converter';
import { Article } from '../entity/article.entity';
import { User } from '../entity/user.entity';
import { removeUndefinedFields } from '../util/fieldset';
import { S3_BUCKET } from '../util/secrets';

interface ArticleInfo {
  article : Article;
  rawHtml : string;
  writer  : {};
}

interface IPatchArticleInput {
  id           : Article['id'];
  title?        : Article['title'];
  markdownKey?  : Article['markdownKey'];
  heroImageUrl? : Article['heroImageUrl'];
}

interface ArticleLikeInput {
  articleId  : Article['id'];
  likeUserId : string;
}

async function getArticleById(articleId: Article['id'], incrementHits = false): Promise<Article> {
  try {
    const connection = getConnection();

    if (incrementHits) {
      await connection
        .createQueryBuilder()
        .update(Article)
        .set({ hits: () => 'hits + 1'})
        .execute();
    }

    const articles = await connection
      .getRepository(Article)
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.writer', 'user', 'article.id = :articleId', { articleId, })
      .getOne();

    return articles;
  } catch (error) {
    throw error;
  }
}

async function getMarkdown(markdownKey: Article['markdownKey']): Promise<string> {
  try {
    const markdownBuffer = await (s3.getObject({
      Bucket: S3_BUCKET,
      Key: markdownKey,
    }).promise());

    return await markdownBuffer.Body.toString();
  } catch (error) {
    throw error;
  }
}

function convertMarkdownToHtml(rawMarkdown: string): string {
  return converter.makeHtml(rawMarkdown);
}

async function createArticle({
  writerId,
  title,
  markdownKey,
  heroImageUrl,
}): Promise<any> {
  try {
    return await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Article)
      .values([
        { writer: writerId, title, markdownKey, heroImageUrl, }
      ])
      .execute();
  } catch (error) {
    throw error;
  }
}

async function getArticles(page = 1, pageSize = 8): Promise<Article[]> {
  try {
    if (page < 1) page = 1;
    return await getConnection()
      .getRepository(Article)
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.writer', 'user')
      .where('article.deletedAt is null')
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  } catch (error) {
    throw error;
  }
}

async function getArticlesByUserId(userId: User['id'], page = 1, pageSize = 9) {
  try {
    if (page < 1) page = 1;
    return await getConnection()
      .getRepository(Article)
      .createQueryBuilder('article')
      .where('writerId = :userId', { userId, })
      .andWhere('deletedAt is null')
      .orderBy('article.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  } catch (error) {
    throw error;
  }
}

async function deleteArticle(articleId: Article['id']): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .update(Article)
      .set({ deletedAt: new Date() })
      .where('id = :articleId', { articleId, })
      .execute();
  } catch (error) {
    throw error;
  }
}

async function patchArticleById(patchList): Promise<void> {
  try {
    const refinedPatchList = removeUndefinedFields(patchList);
    // tslint:disable-next-line: no-string-literal
    delete refinedPatchList['id'];

    await getConnection()
      .createQueryBuilder()
      .update(Article)
      .set({ ...refinedPatchList })
      .where('id = :id', { id: patchList.id })
      .execute();
  } catch (error) {
    throw error;
  }
}

async function likeArticle({
  articleId,
  likeUserId,
}): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .relation(Article, 'likeUser')
      .of(articleId)
      .add(likeUserId);
  } catch (error) {
    throw error;
  }
}

async function retractLikeArticle({
  articleId,
  likeUserId,
}): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .relation(Article, 'likeUser')
      .of(articleId)
      .remove(likeUserId);
  } catch (error) {
    throw error;
  }
}

async function checkLikeArticle({
  articleId,
  likeUserId,
}): Promise<boolean> {
  try {
    const findLike = await getConnection()
      .getRepository(Article)
      .createQueryBuilder('article')
      .innerJoinAndSelect(
        'article.likeUser',
        'user',
        'article.id = :articleId and user.id = :likeUserId',
        { articleId, likeUserId })
      .getOne();

    return findLike ? true : false;
  } catch (error) {
    throw error;
  }
}

export default {
  getArticleById,
  getMarkdown,
  convertMarkdownToHtml,
  createArticle,
  getArticles,
  getArticlesByUserId,
  deleteArticle,
  patchArticleById,
  likeArticle,
  retractLikeArticle,
  checkLikeArticle,
};
