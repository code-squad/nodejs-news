import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
import testArticleController from '../controllers/articleType';
import testCommentController from '../controllers/commentType';
import testController from '../controllers/userType';

const router = Router();

function makeErrorMessage (error) {
  return {
    message: error.message,
    stack: `${error.stack}`,
  };
}

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    await testController.createUser({
      email,
      password: hash,
      provider: 'local',
    });
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await testController.deleteUserById(req.params.id);
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send({...error});
  }
});

router.get('/users/subscriptions', async (req, res, next) => {
  try {
    const subscriptionList = await testController.getSubscriptions(req.body.id, req.query.page, req.query.pageSize);
    return res.send({ message: 'success', subscriptionList });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.get('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await testController.getUserById(req.params.id);
    return res.send({ message: 'success', user });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
      stack: error.stack,
    });
  }
});

router.get('/users/:subscribeeId/subscriptions/:subscriberId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await testController.checkSubscribed({...req.params});
    return res.send({ message: 'success', result: (subscription ? true : false) });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.put('/users/:id', async(req, res, next) => {
  try {
    await testController.patchUserById({
      id: req.params.id,
      email: req.body.email,
      password: req.body.password,
      privilege: req.body.privilege,
      profileImageUrl: req.body.profileImageUrl,
    });

    return res.send({ message: 'success', });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/users/subscriptions/:id', async (req, res, next) => {
  try {
    const subscritbeeId = req.params.id, subscriberId = req.body.id;

    await testController.subscribeUser({
      subscriberId,
      writerId: subscritbeeId,
    });
    return res.send({ message: 'success', });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/users/unsubscriptions/:id', async (req, res, next) => {
  try {
    const subscritbeeId = req.params.id, subscriberId = req.body.id;

    await testController.unsubscribeUser({
      subscriberId,
      writerId: subscritbeeId,
    });
    return res.send({ message: 'success', });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.get('/articles/:id', async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const article = await testArticleController.getRawArticleById(articleId);
    return res.send({ message: 'success', article, });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/articles', async (req, res) => {
  try {
    await testArticleController.createArticle({...req.body});
    return res.send({ message: 'success', });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.get('/articleslist', async (req, res, next) => {
  try {
    const articles = await testArticleController.getArticles(parseInt(req.query.page, 10));

    return res.send({ message: 'success',  articles, });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.delete('/articles/:articleId', async (req, res, next) => {
  try {
    await testArticleController.deleteArticle(req.params.articleId);
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/articles/like/:articleId', async (req, res) => {
  try {
    await testArticleController.likeArticle({articleId: req.params.articleId, likeUserId: req.body.likeUserId});
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.delete('/articles/like/:articleId', async (req, res) => {
  try {
    await testArticleController.retractLikeArticle({articleId: req.params.articleId, likeUserId: req.body.likeUserId});
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.get('/articles/like/:articleId', async (req, res) => {
  try {
    const result = await testArticleController.checkLikeArticle({
      articleId: req.params.articleId,
      likeUserId: req.query.likeUserId
    });
    return res.send({ message: 'success', result, });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/comments/:articleId', async (req, res) => {
  try {
    await testCommentController.createComment({
      articleId: req.params.articleId,
      ...req.body,
    });
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.get('/comments/:articleId', async (req, res) => {
  try {
    const comments = await testCommentController.getComments({
      articleId: req.params.articleId,
      ...req.query,
    });
    return res.send({ message: 'success', comments, });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.post('/comments/like/:commentId', async (req, res) => {
  try {
    await testCommentController.likeComment({
      ...req.params,
      ...req.body,
    });
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

router.delete('/comments/like/:commentId', async (req, res) => {
  try {
    await testCommentController.retractLikeComment({
      ...req.params,
      ...req.body,
    });
    return res.send({ message: 'success' });
  } catch (error) {
    return res.status(500).send(makeErrorMessage(error));
  }
});

export default router;
