import { getConnection, getManager } from 'typeorm';
import { Article } from '../entity/article.entity';
import { Comment } from '../entity/comment.entity';

async function getComments ({
  articleId,
  userId,
  page = 1,
  pageSize = 25,
}): Promise<Comment[]> {
  try {
    if (page < 1) page = 1;
    const rootComments = await getConnection()
      .getRepository(Comment)
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.writer', 'user')
      .leftJoinAndSelect('comment.likeUser', 'likeUser', 'likeUser.id = :userId', { userId, })
      .where('comment.article = :articleId', { articleId, })
      .andWhere('comment.parent is null')
      .andWhere('comment.deletedAt is null')
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return rootComments;
  } catch (error) {
    throw error;
  }
}

async function getCommentCountOfArticle(articleId: Article['id']): Promise<number> {
  try {
    return await getConnection()
      .getRepository(Comment)
      .createQueryBuilder('comment')
      .where('articleId = :articleId', { articleId, })
      .andWhere('deletedAt is null')
      .getCount();
  } catch (error) {
    throw error;
  }
}

async function createComment({
  articleId,
  writerId,
  content,
  parentCommentId,
}): Promise<void> {
  try {
    const newComment = new Comment();
    newComment.writer = writerId;
    newComment.content = content;
    newComment.article = articleId;
    newComment.parent = parentCommentId;

    await getManager().save(newComment);
  } catch (error) {
    throw error;
  }
}

async function removeComment(commentId): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .update(Comment)
      .set({ deletedAt: new Date() })
      .where('id = :commentId', { commentId, })
      .execute();
  } catch (error) {
    throw error;
  }
}

async function likeComment({
  commentId,
  userId,
}): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .relation(Comment, 'likeUser')
      .of(commentId)
      .add(userId);
  } catch (error) {
    throw error;
  }
}

async function retractLikeComment({
  commentId,
  userId,
}): Promise<void> {
  try {
    await getConnection()
      .createQueryBuilder()
      .relation(Comment, 'likeUser')
      .of(commentId)
      .remove(userId);
  } catch (error) {
    throw error;
  }
}

export default {
  getComments,
  getCommentCountOfArticle,
  createComment,
  removeComment,
  likeComment,
  retractLikeComment,
};
