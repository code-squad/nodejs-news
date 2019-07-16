const port = process.env.PORT || '3000';
module.exports = {
    clientID    : '963961621382-5njhlne0bmmqai2vpn3mg6f1ne1dufif.apps.googleusercontent.com',
    clientSecret: 'Kx1yDDRBz0tv5I41Eqog63MO',
    callbackURL : `http://localhost:${port}/auth/google/callback`,
    proxy: true
};

