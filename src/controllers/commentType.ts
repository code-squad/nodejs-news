import { getConnection, getManager } from 'typeorm';
import { TypeComment } from '../entity/comment.entity';

async function getComments ({
  articleId,
  userId,
  page = 1,
  pageSize = 25,
}): Promise<TypeComment[]> {
  try {
    const rootComments = await getConnection()
      .getRepository(TypeComment)
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

async function createComment({
  articleId,
  writerId,
  content,
  parentCommentId,
}): Promise<void> {
  try {
    const newComment = new TypeComment();
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
      .update(TypeComment)
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
      .relation(TypeComment, 'likeUser')
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
      .relation(TypeComment, 'likeUser')
      .of(commentId)
      .remove(userId);
  } catch (error) {
    throw error;
  }
}

export default {
  getComments,
  createComment,
  removeComment,
  likeComment,
  retractLikeComment,
};
