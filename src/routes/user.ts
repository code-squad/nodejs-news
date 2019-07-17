import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import UserController from '../controllers/user';

const userRouter = Router();

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserController.GetUserByObjectId({
      _id: req.params.id,
    });

    return res.send({ user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const user = await UserController.DeleteUserByObjectId({
      _id: req.params.id,
    });

    return res.send({ user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.put('/:id', async (req: Request, res: Response, next) => {
  try {
    const user = await UserController.PutUserById({
      _id: req.params.id,
      email: req.body.email,
      password: req.body.password,
      privilege: req.body.privilege,
      profileImageUrl: req.body.profileImageUrl,
    });

    return res.send({ user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.patch('/ban/:id', async (req: Request, res: Response, next) => {
  try {
    const result = UserController.banUser({
      _id: req.params.id,
      isTemporarily: req.body.isTemporarily,
      hours: req.body.hours,
    });

    return res.send({ result });
  } catch (error) {
    next(createError(500));
  }
});

export default userRouter;
