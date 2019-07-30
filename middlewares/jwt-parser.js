const jwtController = require('../src/jwt-controller');

module.exports = jwtParser = () => {
    return async (request, response, next) => {
                try {
                    const token = request.cookies['jwt'];
                    if (!token) {
                        request.isAuthenticated = false;
                        next();
                    } else {
                        const decodedToken = await jwtController.verifyToken(token);
                        request.user = decodedToken;
                        request.isAuthenticated = true;
                        next();
                    }
                } catch(error) {
                    next(error);
                }
            }
}