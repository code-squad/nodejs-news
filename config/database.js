if(process.env.NODE_ENV === 'production'){
    module.exports = {mongoURI: 'mongodb://sony:thsl1020@ds131747.mlab.com:31747/heroku_h4w63j7q'}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/newsApp'}
}