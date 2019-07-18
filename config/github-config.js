module.exports = {
    clientID    : process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL : `/auth/github/callback`,
    proxy       : true
};
