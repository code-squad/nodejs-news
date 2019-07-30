const User = require('../../model/user');
const jwtController = require('../../src/jwt-controller');

module.exports = {
    register : async (request, response, next) => {
        try {
            const { id, password, nickname } = request.body;
            if (!id || !password || !nickname) throw Error("id, password and nickname is required");
            const provider = 'local';
            const user = await User.create( { id, password, nickname, provider } );
            await user.save();
            return response.redirect('/');
        } catch(error) {
            next(error);
        }
    },

    login : async (request, response, next) => {
        try {
            let token;
            const { id, password } = request.body;
            const user = await User.findOneById(id);
            if (!user) throw Error("Invalided id!");
            if(user.verify(password)) {
                token = await jwtController.makeToken(user);
            }
            response.cookie('jwt', token);
            return response.json({
                message:"login success"
            });
        } catch(error) {
            next(error);
        }
    },

    logout : (request, response) => {
        response.clearCookie('jwt');
        return response.status(200).redirect('/login.html');   
    },

    googleAuthenticate : (passport) => {
        return passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] })
    },

    googleCallbackAuthenticate : (passport) => {
        return passport.authenticate('google', { failureRedirect: '/login.html' });
    },

    setTokenToCookie: (request, response) => {
        response.cookie('jwt', request.user.token);
        response.redirect('/');
    }
}