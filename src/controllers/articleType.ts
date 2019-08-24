import { getConnection } from 'typeorm';
import { TypeArticle } from '../entity/article.entity';
import { TypeUser } from '../entity/user.entity';
import { IArticle } from '../models/article.model';
import { removeUndefinedFields } from '../util/fieldset';

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
  likeUserId : string;
}

async function getRawArticleById(articleId: TypeArticle['id']): Promise<TypeArticle> {
  try {
    const connection = getConnection();

    await connection
      .createQueryBuilder()
      .update(TypeArticle)
      .set({ hits: () => 'hits + 1'})
      .execute();

    const articles = await connection
      .getRepository(TypeArticle)
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.writer', 'typeuser', 'article.id = :articleId', { articleId, })
      .getOne();

    return articles;
  } catch (error) {
    throw error;
  }
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
      .into(TypeArticle)
      .values([
        { writer: writerId, title, markdownKey, heroImageUrl, }
      ])
      .execute();
  } catch (error) {
    throw error;
  }
}

async function getArticles(page = 1, pageSize = 8): Promise<TypeArticle[]> {
  try {
    return await getConnection()
      .getRepository(TypeArticle)
      .createQueryBuilder('article')
      .innerJoinAndSelect('article.writer', 'user')
      .where('article.deletedAt is null')
      .skip((page - 1) & pageSize)
      .take(pageSize)
      .getMany();
  } catch (error) {
    throw error;
  }
}

async function getArticlesByUserId(userId: TypeUser['id'], page: 1, pageSize = 9) {
  try {
    return await getConnection()
      .getRepository(TypeArticle)
      .createQueryBuilder('article')
      .where('writer = :userId and deletedAt is null')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
  } catch (error) {
    throw error;
  }
}

async function deleteArticle(articleId: TypeArticle['id']): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .update(TypeArticle)
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
      .update(TypeArticle)
      .set({ ...refinedPatchList })
      .where('id = :id', patchList.id)
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
      .relation(TypeArticle, 'likeUser')
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
      .relation(TypeArticle, 'likeUser')
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
      .getRepository(TypeArticle)
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
  getRawArticleById,
  createArticle,
  getArticles,
  getArticlesByUserId,
  deleteArticle,
  patchArticleById,
  likeArticle,
  retractLikeArticle,
  checkLikeArticle,
  // getArticleShortInfo,
  // getComments,
  // createComment,
  // removeComment,
  // likeComment,
  // retractLikeComment,

};
