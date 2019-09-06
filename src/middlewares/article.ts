import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';
import { Article } from '../entity/article.entity';
import { Comment } from '../entity/comment.entity';

export const checkArticleOwner = (req: Request, res: Response, next: NextFunction) => {
  getConnection()
  .getRepository(Article)
  .createQueryBuilder('article')
  .innerJoinAndSelect('article.writer', 'user', 'article.id = :id', { id: req.params.id })
  .where('article.deletedAt is null')
  .getOne()
  .then((article: Article) => {
    if (article.writer.id !== req.user.id) return res.status(403).send({ message: '이 게시물에 대한 권한이 없습니다.'}) ;
    next();
  })
  .catch((err) => {
    next(err);
  });
};

export const checkCommentOwner = (req: Request, res: Response, next: NextFunction) => {
  getConnection()
  .getRepository(Comment)
  .createQueryBuilder('comment')
  .innerJoinAndSelect('comment.writer', 'user', 'comment.id = :id', { id: req.params.commentId })
  .where('comment.deletedAt is null')
  .getOne()
  .then((comment: Comment) => {
    if (comment.writer.id !== req.user.id) return res.status(403).send({ message: '이 댓글에 대한 권한이 없습니다.'});
    next();
  })
  .catch((err) => {
    next(err);
  });
};
