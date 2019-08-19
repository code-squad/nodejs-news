const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get('/', (req, res, next) => {
    let token = req.cookies["access-token"];
    let decode = jwt.verify(token, process.env.COOKIE_SECRET, (err, decoded) => {return err ? false : decoded;});
    if(token && decode){
        res.render('main', {title: 'NewsPage', data: "login"})
    }else{
        res.render('main', {title: 'NewsPage', data: "notLogin"})
    }
  });
router.get('/login', (req, res) => {
    res.render('login', {title: 'LoginPage'})
});

router.get('/join', (req, res) => {
    res.render('join', {title : 'signUpPage'})
})

module.exports = router;