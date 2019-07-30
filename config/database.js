if (process.env.NODE_ENV === 'production') {
    module.exports = {mongoURI: process.env.MONGO_URI}
} else if (process.env.NODE_ENV === 'test') {
    module.exports = {mongoURI: 'mongodb://localhost/newsApp_test'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/newsApp'}
}