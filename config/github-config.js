const port = process.env.PORT || '3000';
module.exports = {
    clientID    : '1ac6a4fc88a4a3372720',
    clientSecret: '1d1e56f408427c0f010dfa7641d0b8fc8bb3e541',
    callbackURL : `http://localhost:${port}/auth/github/callback`,
    proxy: true
};

