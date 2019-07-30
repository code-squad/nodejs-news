import { NextFunction, Request, Response } from 'express';
import Article from '../models/article.model';

export const checkArticleOwner = (req: Request, res: Response, next: NextFunction) => {
  Article.findOne({
    _id: req.params.id,
    writerId: req.user.id,
    deletedAt: { $exists: false },
  },
    (err, article) => {
      console.log(article);
      if (err) {
        next(err);
      } else if (!article) {
        res.status(403).send({message: '이 게시물에 대한 권한이 없습니다.'});
      } else {
        next();
      }
    });
};
