import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { profileUpload } from '../config/multer';
import { googleAuthUrl } from '../config/oauth';
import UserController from '../controllers/user';
import { isLoggedIn } from '../middlewares/auth';

const userRouter = Router();

const uploadErrorMessage = '프로필 이미지 업로드에 실패했습니다. 파일 크기(1MB 미만)나 네트워크 회선을 점검해주세요.';

function profileUploadMiddleware(req, res, next) {
  profileUpload.single('profileimg')(req, res, err => {
    if (err) {
      createError(500);
      req.flash('flashMessage', uploadErrorMessage);
      res.redirect('/');
    } else {
      next();
    }
  });
}

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const targetUser = await UserController.getUserById(req.params.id);

    let subscribed = false;

    if (req.user) {
     subscribed = await UserController.checkSubscribed({
       subscribeeId: req.params.id,
       subscriberId: req.user.id,
     });
    }

    return res.render('block/userpage', {
      user: req.user,
      targetUser: targetUser.user,
      subscriberCount: targetUser.subscriberCount,
      subscribed,
      googleAuthUrl });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserController.deleteUserById(req.params.id);

    return res.send({ user });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserController.patchUserById({
      id: req.params.id,
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

userRouter.post('/profile', isLoggedIn, profileUploadMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UserController.patchUserById({
        id: req.user.id,
        // tslint:disable-next-line: no-string-literal
        profileImageUrl: req.file['location'],
    });
    return res.redirect('/');
  } catch (error) {
    createError(500);
    req.flash('flashMessage', uploadErrorMessage);
    res.redirect('/');
  }
});

// userRouter.patch('/ban/:id', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = UserController.banUser({
//       id: req.params.id,
//       isTemporarily: req.body.isTemporarily,
//       hours: req.body.hours,
//     });

//     return res.send({ result });
//   } catch (error) {
//     next(createError(500));
//   }
// });

userRouter.post('/subscriptions/:id', isLoggedIn,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserController.subscribeUser({subscriberId: req.user.id, writerId: req.params.id});

      res.send();
    } catch (error) {
      res.status(500).send({message: '구독에 실패했습니다.'});
    }
});

userRouter.delete('/subscriptions/:id', isLoggedIn,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserController.unsubscribeUser({subscriberId: req.user.id, writerId: req.params.id});

      res.send();
    } catch (error) {
      res.status(500).send({message: '구독 취소에 실패했습니다.'});
    }
});

userRouter.get('/:id/subscriptions/list', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await UserController.getSubscriptions(req.user.id, req.query.page, req.query.pageSize);

    res.render('block/subscription', { user: req.user, googleAuthUrl, subscriptions, });
  } catch (error) {
    next(error);
  }
});

export default userRouter;
