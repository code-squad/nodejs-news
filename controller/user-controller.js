const generateJWTToken = require('../utils/jwt-token-generator');
const passport = require('passport');
const userHandler = require('../utils/db/user');
const pool = require('../db/connect-mysql').pool;
require('../auth/passport').setup()

const userController = {

  addAuthUser : async (req, res, next) => {
    try {
      // 클라이언트에서 중복 체크 후 서버에서도 중복 유저 네임 체크
      const checkDupleUsernameInfo = await pool.query(
        `
        SELECT
        COUNT(*) dupleUsernameCount
        FROM
        USERS
        WHERE
        username = "${req.body.username}"
        `)
        
      const [dupleUsername] = checkDupleUsernameInfo;
      const {dupleUsernameCount} = dupleUsername[0];
  
      if (dupleUsernameCount > 0) {
        return res.end('dupleUsername');
      }

      if (req.files.length > 0) {
        req.body.photolink = req.files[0].location
      }

      const {username, location, introduction, authGoogleId, photolink} = req.body;

      const [result] = await pool.query(
      `
        INSERT INTO USERS
        (username, location, introduction, auth_google_id, photo_link)
        VALUES
        ("${username}", "${location}", "${introduction}", "${authGoogleId}", "${photolink}");
      `
      )
      
      if (result.affectedRows === 1 && result.serverStatus === 2) {
        // db insert 후 회원가입 완료, jwt 토큰 발급
        const user = userHandler.makeUserObj(result.insertId, username, photolink);
        await generateJWTToken(res, user);
        return res.end('success');
      }
      
    } catch (error) {
      next(error);
    }
  },

  addUser : (req, res, next) => {
    try {
      passport.authenticate('signup', {
        session : false
      }, async (err, user, info) => {
  
        req.flash('message', info.message)
        
        if (!user) {
          return res.redirect('/signup')
        }
  
        // 회원가입 후 자동 로그인 : jwt 토큰 생성 후 메인 페이지로 리다이렉트 
        await generateJWTToken(res, user);
        return res.redirect('/');
      
      })(req, res, next)

    } catch (error) {
      next(error)
    }
  },

  deleteUser : async (req, res, next) => {
    try {
      await pool.query(`
        UPDATE USERS
        SET validation = 'N'
        WHERE ID = ${req.user.id};
      `);

      req.flash('message', {'info' : '회원 탈퇴가 완료되었습니다'});
      res.clearCookie('token', { path: '/' })

      res.end('success');
    } catch (error) {
      next(error);
    }
  },

  updateUser : async (req, res, next) => {
    try {
      const userId = req.params.userId;

      const [userRow] = await pool.query(`
        SELECT * FROM USERS WHERE ID = ${userId};
      `)
      const user = userRow[0];

      let {location, introduction, password} = req.body;

      let updatedPhotolink, updatedPassword;

      if (req.files.length > 0) {
        updatedPhotolink = req.files[0].location;
      }
      if (password && password !== '') {
        updatedPassword = await userHandler.getCryptoPassword(password);
      }

      await pool.query(`
        UPDATE USERS
        SET
          LOCATION = "${location}",
          INTRODUCTION = "${introduction}",
          PASSWORD = "${updatedPassword || user.PASSWORD}",
          PHOTO_LINK = "${updatedPhotolink || user.PHOTO_LINK}"
        WHERE ID = ${user.ID};
      `);

      return res.end('success');

    } catch (error) {
      console.error(error)
      next(error);
    }
  },

  getSettingsPage : async (req, res) => {

    const [userRow] = await pool.query(`
      SELECT * FROM USERS WHERE ID = ${req.user.id};
    `)

    if (userRow.length === 0) {
      req.flash('message', {'info' : '해당하는 회원 정보가 없습니다'});
      res.redirect('/');
    }

    const userInfo = userRow[0];

    const user = {
      id : userInfo.ID,
      photolink: userInfo.PHOTO_LINK,
      username: userInfo.USERNAME,
      location: userInfo.LOCATION,
      introduction: userInfo.INTRODUCTION,
      authId: userInfo.AUTH_GOOGLE_ID,
    }

    res.render('settings', {
      title: 'Settings | Daily Frame',
      user
    });
  },

  getInitSettingsPage : (req, res) => {
    res.render('initSettings', {
      title: 'Settings | Daily Frame',
      user : req.user,
      message : req.flash('message')
    });
  },

  getLikesPage : async (req, res, next) => {
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

      console.log(author);
      
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

      // 좋아요를 누른 게시물 가져오기
      const [likeRow] = await pool.query(`
        SELECT * FROM LIKES WHERE user_id = ${author.id};
    `)

      const posts = await likeRow.reduce(async (acc, row) => {
        const postId = row.POST_ID;
        const [likePosts] = await pool.query(`
  
        SELECT
          author.id author_id, author.username author_username, author.photo_link author_photolink,
          post.id post_id, post.content post_content, post.photo_link post_photolink, post.created_date post_created_Date, post.view_count post_view_count, post.like_count post_like_count, post.comment_count post_comment_count
        FROM
          USERS as author
        JOIN
          ( select * from POSTS where ID = ${postId} and validation = "Y" ) as post
        ON
          post.USER_ID = author.ID
        limit
          20;
        `)
  
        likePosts.forEach(async row => {
          acc = await acc;
          acc.push(row)
        });
        
        return await acc;
      }, []);
      

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

      res.render("likes", {
        title: "Likes | The creators Network",
        author,
        user,
        posts
      });
    } catch (error) {
      next(error);      
    }
    }
}

module.exports = userController;