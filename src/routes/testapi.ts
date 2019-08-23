import bcrypt from 'bcrypt';
import { NextFunction, Request, Response, Router } from 'express';
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



export default router;