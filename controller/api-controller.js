const emailsendUtil = require('../utils/nodemailer');
const jwt = require('jsonwebtoken');
const userHandler = require('../utils/db/user');
const pool = require('../db/connect-mysql').pool;

const apiController = {
  sendPasswordCheckEmail : async (req, res, next) =>{
    emailsendUtil(req.body.email);
    req.flash('message', {'info' : `[ ${req.body.email} ]로 안내 링크가 전송되었습니다`});
    res.redirect('/forgotpassword')
  },

  resetPassword : async (req, res, next) => {
    let {token, password } = req.body;
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decodedToken.address) {
      req.flash('message', {'error' : '올바르지 않은 접근 경로입니다'});
      return res.redirect('/');
    }

    try {
      password = await userHandler.getCryptoPassword(password);

      const [resultRow] = await pool.query(`
        UPDATE USERS
        SET PASSWORD = "${password}"
        WHERE EMAIL = "${decodedToken.address}"
      `)
      
      if (resultRow.affectedRows !== 1) {
          return res.end('false');
      }
      
      return res.end('true');
    } catch (error) {
      next(error);
    }
  },

  updateFollowStatus : async (req, res, next) => {

    try {
      const followingId = req.params.userId;
      
      // follow 상태인지 확인
      const [followStatusRow] = await pool.query(
        `
          SELECT * FROM FOLLOW WHERE FOLLOWER_ID = ${req.user.id} and FOLLOWING_ID = ${followingId};
        `
      )

      // follow 상태가 아니라면 insert
      if (followStatusRow.length === 0) {
       await pool.query(
          `
          INSERT INTO FOLLOW (FOLLOWER_ID, FOLLOWING_ID) VALUES(${req.user.id}, ${followingId});
          `
        )
        return res.end('follow');
      }

      // follow 상태라면 delete
      await pool.query(
        `
          DELETE FROM FOLLOW WHERE FOLLOWER_ID = ${req.user.id} and FOLLOWING_ID = ${followingId};
        `
      )
      return res.end('unfollow');
      
    } catch (error) {
      next(error);
    }
  },
}

module.exports = apiController;