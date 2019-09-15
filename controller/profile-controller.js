const pool = require("../db/connect-mysql").pool;

const profileController = {
  home: async (req, res, next) => {
    try {
      let authorUsername = req.params.username;

      // 해당 profile 정보 가져오기
      const [authorRow] = await pool.query(`
        SELECT id, username, location, introduction, photo_link
        FROM USERS
        WHERE
        username = "${authorUsername}"
        AND
        validation = "Y";
      `);
      
      if (authorRow.length === 0) {
        req.flash('message', {'info' : '존재하지 않는 회원입니다'});
        return res.redirect('/');
      }
      const author = authorRow[0];
      
      // profile에 필요한 좋아요, 작성 게시글, 팔로워, 팔로우 수 가져오기
      const [authorInfoRow] = await pool.query(
        `
        SELECT *
        FROM 
        (select count(*) like_count from LIKES where user_id = ${author.id}) as likes
        JOIN
        (select count(*) post_count from POSTS where user_id = ${author.id}) as posts
        JOIN
        (select count(*) following_count from FOLLOW where follower_id = ${author.id}) as following
        JOIN
        (select count(*) follower_count from FOLLOW where follower_id = ${author.id}) as follower
        `
      )
      author.info = authorInfoRow[0];

      // 해당 profile author가 게시한 게시물 가져오기
      const [posts] = await pool.query(`
        SELECT * FROM POSTS WHERE USER_ID = ${author.id} and validation = "Y";
      `)

      // 접속한 로그인 유저 정보
      const user = req.user;
      if (user) {

        // profile author 와 follow 관계인지 확인
        const [followRow] = await pool.query(`
          SELECT COUNT(*) as isFollow FROM FOLLOW WHERE follower_id = "${user.id}" and following_id = "${author.id}"
        `)

        user.isFollow = followRow[0].isFollow;

        // 좋아요를 누른 게시물 가져오기
        const [likeRow] = await pool.query(`
          SELECT * FROM LIKES WHERE user_id = ${user.id};
        `)

        let likeObj;

        if (likeRow.length > 0) {
          likeObj = likeRow.reduce((acc, val) => {
            const post = val.POST_ID;
            acc[post] = post;
            return acc;
          })
        }
        user.like = likeObj;
      }

      res.render("profile", {
        title: "Profile | The creators Network",
        author,
        user: req.user,
        posts
      });

    } catch (error) {
      next(error);      
    }
  }
};

module.exports = profileController;
