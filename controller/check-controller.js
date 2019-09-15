const pool = require('../db/connect-mysql').pool;

const checkController = {
  checkDupleUsername : async (req, res, next) =>{
    try {
      const username = req.params.username;
      
      const [userRow] = await pool.query(`
        SELECT ID FROM USERS WHERE USERNAME = "${username}";
      `)
      
      if (userRow.length > 0) {
        return res.send(true);
      }
      return res.send(null);

    } catch (error) {
      next(error);
    }
  },

  checkDupleEmail : async (req, res, next) =>{
    try {
      const email = req.params.email;
      
      const [emailRow] = await pool.query(`
        SELECT ID FROM USERS WHERE EMAIL = "${email}";
      `)
      
      if (emailRow > 0) {
        return res.send(true);
      }
      return res.send(null);

    } catch (error) {
      next(error);      
    }
  }
}

module.exports = checkController;