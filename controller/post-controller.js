const pool = require('../db/connect-mysql').pool;

const postController = {
  uploadPost: async (req, res, next) => {
    try {
      const [content, photo] = [req.body.content, req.files[0]];

      // 사진이 없을 경우
      if (photo === undefined) {
        req.flash('message', {'info' : '사진은 반드시 작성해야 합니다'});
        return res.redirect('/');
      }

      const [result] = await pool.query(
        `
          INSERT INTO POSTS
          (CONTENT, PHOTO_LINK, USER_ID)
          VALUES
          ("${content}", "${photo.location}", "${req.user.id}");
        `
      )

      // 포스팅한 게시물로 이동
      return res.redirect(`/contents/${result.insertId}`)

    } catch (err) {
      next(err);
    }
  }
}

module.exports = postController;