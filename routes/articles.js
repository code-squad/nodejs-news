const express = require('express');
const router = express.Router();
const Article = require('../model/articles');
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');

router.get('/add', (req, res, next) => {
    res.render("articles/add");
});

router.get('/:field', isLoggedIn, async (req, res, next) => {
    try {
        const articles = await Article.find({field: req.params.field});
        if (articles) {
            res.render('articles/index', {
                articles: articles
            })
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/show/:id', async (req, res, next) => {
    try {
        const article = await Article.findOne({
            _id: req.params.id
        }).populate('comments.commentUser');
        if (article) {
            res.render('articles/show', {
                article: article
            })
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/add', async (req, res, next) => {
    console.log(req.body);

    const newArticle = {
        title: req.body.title,
        body : req.body.body,
        field: req.body.field,
        user : req.user.id
    };
    try {
        const article = await new Article(newArticle).save();
        if (article) {
            res.redirect('/articles/' + req.body.field);
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/edit/:id', async (req, res) => {
    try {
        const article = await Article.findOne({
            _id: req.params.id
        });
        if (article) {
            res.render('articles/edit', {
                article: article
            });
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const article = await Article.findOne({_id: req.params.id});
        if (article) {
            article.title = req.body.title;
            article.body = req.body.body;
            article.field = req.body.field;
            const isSaved = await article.save();
            if (isSaved) {
                res.redirect('/articles/' + req.body.field);
            }
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }

});

router.delete('/:id', async (req, res, next) => {
    try {
        const isDeleted = await Article.remove({_id: req.params.id});
        if (isDeleted) {
            res.redirect('/articles/' + req.body.field);
        }

    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/comment/:id', async (req, res, next) => {
    try {
        const article = await Article.findOne({_id: req.params.id});
        if (article) {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user.id
            };
            // Add to comments array
            article.comments.unshift(newComment);

            const isSaved = article.save();
            if (isSaved) {
                res.redirect('/articles/show/' + article.id)
            }
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.delete('/comment/:id', async (req, res, next) => {
    try {
        const [articleId, commentId] = req.params.id.split('&');
        const isDeleted = await Article.updateOne({_id: articleId}, {$pull: {'comments': {_id: commentId}}});

        if (isDeleted) {
            res.redirect('/articles/show/' + articleId);
        }

    } catch
        (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/:id/act', async (req, res, next) => {
    const action = req.body.action;
    const counter = action === 'Like' ? 1 : -1;
    try {
        const likesStatusUpdated = await Article.update({_id: req.params.id}, {$inc: {likes_count: counter}}, {});
        if (likesStatusUpdated) {
            res.redirect('/articles/show/' + req.params.id);
        }
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

module.exports = router;
