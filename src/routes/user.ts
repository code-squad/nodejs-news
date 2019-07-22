import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { IS3Request, profileUpload } from '../config/multer';
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
    const targetUser = await UserController.GetUserById({
      _id: req.params.id,
    });

    return res.render('block/userpage', { user: req.user, targetUser });
  } catch (error) {
    createError(500);
    next(error);
  }
});

userRouter.delete('/:id', async (req: Request, res: Response, next) => {
  try {
    const user = await UserController.DeleteUserById({
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
    const user = await UserController.PatchUserById({
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

userRouter.post('/profile', isLoggedIn, profileUploadMiddleware, async (req: IS3Request, res: Response, next: NextFunction) => {
  try {
    await UserController.PatchUserById({
        _id: req.user._id,
        profileImageUrl: req.file.location,
    });
    return res.redirect('/');
  } catch (error) {
    createError(500);
    req.flash('flashMessage', uploadErrorMessage);
    res.redirect('/');
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
