const express = require('express');
const router = express.Router();
const Article = require('../model/articles');

/* GET home page. */
router.get('/', async (req, res, next) => {
    const articles = await Article.find();
    if (articles) {
        res.render('articles/index', {
            articles: articles
        })
    }
});

module.exports = router;
