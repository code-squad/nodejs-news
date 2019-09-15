const pool = require('../db/connect-mysql').pool;

const indexController = {
  home: async (req, res, next) => {
    try {

      // 테이블 풀스캔 대신 인덱스 먼저 접근 후 join 실행
      const [posts] = await pool.query(
        `
        SELECT
        post.ID as post_id, post.content as content, post.photo_link as photo_link,
        post.like_count as like_count, user.username as username
        FROM
          POSTS as post
        JOIN
          USERS as user
        ON
          post.user_id = user.id
        JOIN
        (
          SELECT id
          FROM POSTS
          WHERE VALIDATION = "Y"
          ORDER BY id desc
        ) post2
        ON
          post.id = post2.id
        limit 20
        `
      )
  
      res.render('main', {
        title: 'Daily Frame | The creators Network',
        user: req.user,
        posts,
        message : req.flash('message')
      });

    } catch (error) {
      next(error);
    }
  },

  signin: (req, res) => {
    res.render('signin', {
      title: 'Sign in | Daily Frame',
      message : req.flash('message')
    });
  },

  signup: (req, res) => {
    res.render('signup', {
      title: 'Sign up | Daily Frame',
      message : req.flash('message')
    });
  },

  forgotpassword: (req, res) => {
    const message = req.flash('message')[0];
    res.render('forgotpassword', {
      title: 'Forgot Password | Daily Frame',
      user: req.user,
      message: message || false
    });
  },

  discover : async (req, res, next) => {

    try {
      const user = req.user;

      // 날짜별 최신 상위 20개 포스트 가져오기
      const [posts] = await pool.query(
        `
        SELECT
          post.ID as post_id,
          post.content as content,
          post.photo_link as photo_link,
          post.like_count as like_count,
          post.created_date as created_date,
          post.view_count as view_count,
          post.like_count as like_count,
          post.comment_count as comment_count,
          author.username as author_username,
          author.id as author_id,
          author.photo_link as author_photolink
        FROM
          POSTS as post
        JOIN
          USERS as author
        ON
          post.user_id = author.id
        JOIN
        (
          SELECT id
          FROM POSTS
          WHERE VALIDATION = "Y"
          ORDER BY id desc
        ) post2
        ON
          post.id = post2.id
        limit 20
        `
      )

      if (user) {
        // 로그인한 유저일 경우, 팔로우 목록 가져오기
        const [followRow] = await pool.query(
          `
          SELECT * FROM FOLLOW WHERE follower_id = ${user.id};
          `
        );

        const followObj = followRow.reduce((acc, row) => {
          const following = row.FOLLOWING_ID;
          acc[following] = following;
          return acc;
        },{})

        user.follow = followObj;

        // 좋아요 목록 가져오기
        const [likeRow] = await pool.query(
          `
          SELECT * FROM LIKES WHERE user_id = ${user.id};
          `
        )

        const likeObj = likeRow.reduce((acc, row) => {
          const post = row.POST_ID;
          acc[post] = post;
          return acc;
        },{})
        user.like = likeObj;
      }

      res.render('discover', {
        title: 'Discover | Daily Frame',
        posts,
        user
      });
    } catch (error) {
      next(error);
    }
  },

  following : async (req, res, next) => {

    try {
      const user = req.user;
    
      // follow 정보 가져오기
      const [followingRow] = await pool.query(`
        SELECT FOLLOWING_ID FROM FOLLOW WHERE FOLLOWER_ID = ${user.id};
      `);
  
      const followObj = followingRow.reduce((acc, row) => {
        const following = row.FOLLOWING_ID;
        acc[following] = following;
        return acc;
      },{})
  
      user.follow = followObj;

      // 좋아요 목록 가져오기
      const [likeRow] = await pool.query(
        `
        SELECT * FROM LIKES WHERE user_id = ${user.id};
        `
      )

      const likeObj = likeRow.reduce((acc, row) => {
        const post = row.POST_ID;
        acc[post] = post;
        return acc;
      },{})
      user.like = likeObj;
  
      // follow한 사용자의 post 목록 가져오기
      const posts = await followingRow.reduce(async (acc, row) => {
        const followingId = row.FOLLOWING_ID;
        const [followPosts] = await pool.query(`
  
        SELECT
          author.id author_id, author.username author_username, author.photo_link author_photolink,
          post.id post_id, post.content post_content, post.photo_link post_photolink, post.created_date post_created_Date, post.view_count post_view_count, post.like_count post_like_count, post.comment_count post_comment_count
        FROM
          USERS as author
        JOIN
          ( select * from POSTS where USER_ID = ${followingId} and validation = "Y" ) as post
        ON
          post.USER_ID = author.ID
        limit
          20;
        `)
  
        followPosts.forEach(async row => {
          acc = await acc;
          acc.push(row)
        });
        
        return await acc;
      }, []);
  
      res.render('following', {
        title: 'Following | Daily Frame',
        user,
        posts
      });
      
    } catch (error) {
      next(error);
    }
  }
}

module.exports = indexController;