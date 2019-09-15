const jwt = require('jsonwebtoken')

const checkJwtToken = () => async (req, res, next) => {
  
  if (!req.cookies.token) {
    req.user = undefined;
    return next();
  }
  
  const token = req.cookies.token;

  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    let user = decodedToken.user;
    req.user = user;
    return next();

  } catch (error) {
    return next(error);
  }
}

module.exports = checkJwtToken;