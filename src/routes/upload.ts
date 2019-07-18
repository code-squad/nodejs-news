import { NextFunction, Request, Response, Router } from 'express';
import createError from 'http-errors';
import { profileUpload } from '../config/multer';
import userController from '../controllers/user';
import { isLoggedIn } from '../middlewares/auth';

// Default req.file is Express.Multer.File, so cannot use location and bucket property.
interface IS3File extends Express.Multer.File {
  bucket   : string;
  location : string;
}

interface IS3Request extends Request {
  file : IS3File;
}

const uploadRouter = Router();
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

uploadRouter.post('/profile', isLoggedIn, profileUploadMiddleware , async (req: IS3Request, res: Response, next: NextFunction) => {
  try {
    await userController.PatchUserById({
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

export default uploadRouter;
