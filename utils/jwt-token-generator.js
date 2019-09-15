const jwt = require('jsonwebtoken');
require('dotenv').config()

const generateJWTToken = async (res, obj) => {
  const token = await jwt.sign({ "user": obj }, process.env.JWT_SECRET);
  res.cookie('token', token, {
    httpOnly : true,
    maxAge: 1000*60*60
  });
  return token;
}

module.exports = generateJWTToken;