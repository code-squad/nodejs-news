const express = require('express');
const router = express.Router();

router.post('/', (req, res)=>{
    let token = req.cookies["access-token"];
    let subject = req.body.subject;
    let image = req.body.image;
    let contents = req.body.contents;
    if(token){
        res.render('post', {title: 'NewsPage', subject: subject, image: image, contents: contents, data : "login"})
    }
})

router.get('/', (req, res)=>{
    console.log("sdf")
    let token = req.cookies["access-token"];
    if(token){
        res.render('report', {title: 'Report', data : "login"})
    }
})

router.post('/save', (req, res, next) => {
    // req.body
    console.log("req",req.body)
    return res.redirect('/post')
});



module.exports = router;