const User = require('../../model/user');

module.exports = {
    register : (request, response) => {
        const onError = (error) => {
            if (typeof(error) === "string") {
                response.status(409);
                response.send(error);
            } else if (error.errmsg) {
                response.status(409).send(error.errmsg);
            } else {
                console.log(error);
                response.status(503).send(error);
            }
        }

        const create = () => {
                let { email, password, nickname } = request.body;
                if (!email || !password || !nickname) {
                    return Promise.reject("email, password and nickname is required");
                }
                const user = User.create( email, password, nickname )
                return user;
        }

        const respond = () => response.redirect('/');

        return create()
        .then(respond)
        .catch(onError)
    },

    authenticate : (passport) => {
            return passport.authenticate('local', { successRedirect: '/',
                                    failureRedirect: '/login' });
    },

    logout : (request, response) => {
        request.logout();
        response.redirect('/');
    }
}