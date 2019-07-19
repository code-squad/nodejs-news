const express = require('express');
const router = express.Router();
const Article = require('../model/articles');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

router.get('/add', (req, res, next) => {
    res.render("articles/add");
});

router.get('/:field', isLoggedIn, (req, res, next) => {
    Article.find({field: req.params.field})
        .then(articles => {
            res.render('articles/index', {
                articles: articles
            })
        })
});

router.get('/show/:id', (req, res) => {
    Article.findOne({
        _id: req.params.id
    })
        .then(article => {
            res.render('articles/show', {
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
        .then(article => res.redirect('/articles/' + req.body.field));

});

router.get('/edit/:id', (req, res) => {
    Article.findOne({
        _id: req.params.id
    }).then(article => {
        console.log(article);
        res.render('articles/edit', {
            article: article
        });
    });
});

router.put('/:id', (req, res) => {

    Article.findOne({_id: req.params.id})
        .then(article => {
            article.title = req.body.title;
            article.body = req.body.body;
            article.field = req.body.field;

            article.save()
                .then(article => {
                    res.redirect('/articles/' + req.body.field);
                })
        })
});

router.delete('/:id', (req, res) => {
    Article.remove({_id: req.params.id})
        .then(() => res.redirect('/articles/' + req.body.field))
});

module.exports = router;
