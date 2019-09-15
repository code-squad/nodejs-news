const pool = require('../db/connect-mysql').pool;

const contentController = {
  getContentPage: async (req, res, next) => {
    try {
      // 게시물과 게시물 작성자 정보 가져오기
      const [postRowData] =  await pool.query(
        `
        SELECT
          author.id author_id, author.username author_username, author.photo_link author_photolink,
          post.id post_id, post.content post_content, post.photo_link post_photolink, post.created_date post_created_Date, post.view_count post_view_count, post.like_count post_like_count, post.comment_count post_comment_count
        FROM
          USERS as author
        JOIN
          ( select * from POSTS where id = "${req.params.contentNumber}" ) as post
        ON
          post.USER_ID = author.ID;
    `);

      const post = postRowData[0];

      // comment 정보 가져오기
      const [commentRowData] = await pool.query(
        `
        SELECT
          comment.id comment_id,
          comment.comment comment_comment,
          comment.created_date comment_created_date,
          comment.validation comment_validation,
          user.id user_id, user.username user_username, user.photo_link user_photolink
        FROM
          COMMENTS as comment
        JOIN
          (SELECT * from POSTS where id = "${req.params.contentNumber}") as post
        ON
          post.ID = comment.post_id
        JOIN
          USERS as user
        ON
          comment.USER_ID = user.ID
          and
          comment.VALIDATION = 'Y';
        `
      )

      post.comments = commentRowData;

      // 게시물과 login user 와의 관계 (좋아요를 눌렀는지, 작성자와 팔로우가 됐는지)
      if (req.user) {
        const [followRow] = await pool.query(
          `
          SELECT follower_id, following_id
          FROM FOLLOW
          WHERE follower_id = "${req.user.id}" and following_id = "${post.author_id}";
          `
          )

        const [likeRow] = await pool.query(
          `
          SELECT user_id, post_id
          FROM LIKES
          WHERE user_id = "${req.user.id}" and post_id = "${post.post_id}";
          `
        )
        req.user.follow = followRow[0];
        req.user.like = likeRow[0];
      }

      // 게시물 조회 수 update
      await pool.query(
        `
        UPDATE POSTS
        SET VIEW_COUNT = VIEW_COUNT + 1
        WHERE ID = "${req.params.contentNumber}";
        `
      )
      
      res.render('content', {
        title: 'Daily Frame | The creators Network',
        user: req.user,
        post,
      });
      
    } catch (error) {
      next(error);
    }
  },

  deleteContent : async (req, res, next) => {
    try {
      await pool.query(
        `
        UPDATE POSTS
        SET VALIDATION = "N"
        WHERE ID = ${req.content.ID};
        `
      );

      return res.end('success');
    } catch (error) {
      next(error);
    }
  },

  updateContent : async (req, res, next) => {
    try {
      let updatedImg, updatedContent;

      if (req.files.length > 0) {
        updatedImg = req.files[0].location;
      }

      if (req.body.content) {
        updatedContent = req.body.content;
      }

      await pool.query(`
        UPDATE POSTS
        SET
          PHOTO_LINK = "${updatedImg || req.content.PHOTO_LINK}",
          CONTENT = "${updatedContent || req.content.CONTENT}"
        WHERE ID = ${req.content.ID};
      `)
      return res.end('success');

    } catch (error) {
      console.error(error);
      next(error);
    }
  },

  updateLike : async (req, res, next) => {
    try {

      const [userId, postId] = [req.user.id, req.params.contentNumber];
      const connection = await pool.getConnection(async conn => conn);

      const [likeStatusRow] = await connection.query(
        `
        SELECT * FROM LIKES WHERE USER_ID = ${userId} and POST_ID = ${postId};
        `
      );

      if (likeStatusRow.length === 0) {
        // like 테이블에 삽입 후 해당 post의 like_count 업데이트
        await connection.beginTransaction();
        await connection.query(
          "INSERT INTO LIKES (USER_ID, POST_ID) VALUES(?, ?)",
          [userId, postId]
        )
        
        await connection.query(
          `
          UPDATE POSTS
          SET LIKE_COUNT = LIKE_COUNT + 1
          WHERE ID = "${postId}";
          `
        )
          
          await connection.commit();
          connection.release();
          return res.end('like');
      }

      // like 테이블에 삭제 후 해당 post의 like_count 업데이트
      await connection.beginTransaction();
      await connection.query(
        `
        DELETE FROM LIKES WHERE USER_ID = ${userId} and POST_ID = ${postId};
        `
      )
      
      await connection.query(
        `
        UPDATE POSTS
        SET LIKE_COUNT = LIKE_COUNT - 1
        WHERE ID = "${postId}";
        `
      )
      
      await connection.commit();
      connection.release();
      return res.end('unlike');
    
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = contentController;