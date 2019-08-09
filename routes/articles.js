const express = require('express');
const router = express.Router();
const Article = require('../model/articles');
const {isLoggedIn, isNotLoggedIn} = require('../middleware/auth');
const asyncMiddleware = require('../middleware/async');

router.get('/add', (req, res, next) => {
    res.render("articles/add");
});

router.get('/:field', isLoggedIn, asyncMiddleware(async (req, res) => {
    const articles = await Article.find({field: req.params.field});
    if (articles) {
        res.render('articles/index', {
            articles: articles
        })
    }
}));

router.get('/press/:press', isLoggedIn, asyncMiddleware(async (req, res) => {
    const articles = await Article.find({press: req.params.press});
    if (articles) {
        res.render('articles/index', {
            articles: articles
        })
    }
}));

router.get('/show/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const article = await Article.findOne({
        _id: req.params.id
    }).populate('comments.commentUser');
    if (article) {
        res.render('articles/show', {
            article: article
        })
    }
}));

router.post('/add', isLoggedIn, asyncMiddleware(async (req, res) => {
    console.log(req.body);
    const newArticle = {
        title: req.body.title,
        body : req.body.body,
        press : req.body.press,
        field: req.body.field,
        image: req.body.image,
        user : req.user.id
    };
    const article = await new Article(newArticle).save();
    if (article) {
        res.redirect('/articles/' + req.body.field);
    }
}));

router.get('/edit/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const article = await Article.findOne({
        _id: req.params.id
    });
    if (article) {
        res.render('articles/edit', {
            article: article
        });
    }
}));

router.put('/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const article = await Article.findOne({_id: req.params.id});
    if (article) {
        article.title = req.body.title;
        article.body = req.body.body;
        article.field = req.body.field;
        article.press = req.body.press;
        article.image = req.body.image;
        const isSaved = await article.save();
        if (isSaved) {
            res.redirect('/articles/' + req.body.field);
        }
    }
}));

router.delete('/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const isDeleted = await Article.remove({_id: req.params.id});
    if (isDeleted) {
        res.redirect('/articles/' + req.body.field);
    }

}));

router.post('/comment/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const article = await Article.findOne({_id: req.params.id});
    if (article) {
        const newComment = {
            commentBody: req.body.commentBody,
            commentUser: req.user.id
        };
        // Add to comments array
        article.comments.unshift(newComment);

        const isSaved = await article.save();
        if (isSaved) {
            res.redirect('/articles/show/' + article.id)
        }
    }
}));

router.delete('/comment/:id', isLoggedIn, asyncMiddleware(async (req, res) => {
    const [articleId, commentId] = req.params.id.split('&');
    const isDeleted = await Article.updateOne({_id: articleId}, {$pull: {'comments': {_id: commentId}}});

    if (isDeleted) {
        res.redirect('/articles/show/' + articleId);
    }

}));

router.post('/:id/act', isLoggedIn, asyncMiddleware(async (req, res) => {
    const action = req.body.action;
    const counter = action === 'Like' ? 1 : -1;
    const likesStatusUpdated = await Article.updateOne({_id: req.params.id}, {$inc: {likes_count: counter}}, {});
    const article = await Article.findOne({_id: req.params.id});
    const userId = req.user.id;
    const alreadyLiked = article.likesUser.filter((e) => e === userId).length;
    if (alreadyLiked) {
        article.likesUser.remove(userId);
    } else {
        article.likesUser.push(userId);
    }
    await article.save();

    if (likesStatusUpdated) {
        res.redirect('/articles/show/' + req.params.id);
    }
}));

module.exports = router;
