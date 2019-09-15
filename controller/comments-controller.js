const pool = require("../db/connect-mysql").pool;

const commentsController = {
  addComment: async (req, res, next) => {

    try {
      const { comment, contentId } = req.body;
      const connection = await pool.getConnection(async conn => conn);

      // comment 등록, post 조회수 업데이트 트랜잭션
      await connection.beginTransaction();
      const [commentRow] = await connection.query(
        "INSERT INTO COMMENTS(COMMENT, POST_ID, USER_ID) VALUES(? ,?, ?)",
        [comment, contentId, req.user.id]
      );

      const [postRow] = await connection.query(
        `
        UPDATE POSTS
        SET COMMENT_COUNT = COMMENT_COUNT + 1
        WHERE ID = "${contentId}";
        `
      );
      await connection.commit();
      connection.release();

      // ajax 추가를 위한 update 데이터
      const updatedComment = {
        "userAvatar" : req.user.photolink,
        "username" : req.user.username,
        "content" : comment,
        "id" : commentRow.insertId,
        "createdDate" : Date.now(),
      }

      return res.json(updatedComment);
      
    } catch (error) {
      next(error);
    }
  },
  
  removeComment: async (req, res, next) => {
    try {
      const {postId, commentId} = req.params;
      const connection = await pool.getConnection(async conn => conn);
      await connection.beginTransaction();

      const [commentRow] = await connection.query(`
        UPDATE COMMENTS
        SET VALIDATION = "N"
        WHERE ID = ${commentId};
      `);

      const [postRow] = await connection.query(
        `
        UPDATE POSTS
        SET COMMENT_COUNT = COMMENT_COUNT - 1
        WHERE ID = ${postId};
        `
      );

      await connection.commit();
      connection.release();

      res.end("success");
    } catch (error) {
      next(error);
    }
  },

  updateComment: async (req, res, next) => {
    try {
      const { id, updatedReply } = req.body;
  
      await pool.query(`
        UPDATE COMMENTS
        SET COMMENT = "${updatedReply}"
        WHERE ID = ${id};
      `)
    
      return res.end("success");
    
    } catch (error) {
      next(error);
    }
  }
};

module.exports = commentsController;
