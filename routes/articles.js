const express = require('express');
const router = express.Router();
const Article = require('../model/articles');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

router.get('/add', (req, res, next) => {
    res.render("articles/add");
});

router.get('/Broadcasting&Communication', isLoggedIn, (req, res, next) => {
    Article.find({field: 'Broadcasting&Communication'})
        .then(articles => {
            res.render('articles/index', {
                articles: articles
            })
        })
});

router.get('/show/:id', (req,res)=>{
    Article.findOne({
        _id: req.params.id
    })
        .then(article =>{
            res.render('articles/show',{
                article: article
            })
        })
});

router.post('/add', (req, res, next) => {
    console.log(req.body);

    const newArticle = {
        title: req.body.title,
        body : req.body.body,
        field: req.body.field,
        user : req.user.id
    };

    new Article(newArticle).save()
        .then(article => res.redirect('/articles/add'));

});


module.exports = router;
