const Post = require('../model/post');
const pool = require('../db/connect-mysql').pool;

const isSameUser = (req, content) => {
  return req.user.id === content.USER_ID;
}

const isAuthor = async (req, res, next) => {

  const [contentRow] = await pool.query(`
    SELECT * FROM POSTS WHERE ID = ${req.params.contentNumber};
  `)

  const content = contentRow[0];

  if (isSameUser(req, content)) {
    req.content = content;
    return next();
  }

  req.flash('message', {'warning' : '권한 없음'});
  return res.redirect(`/contents/${content.ID}`);
};

const isNotAuthor = async (req, res, next) => {
  
  const content = await Post.findById(req.params.contentNumber);

  if (!isSameUser(req, content)) {
    req.content = content;
    return next();
  }

  req.flash('message', {'warning' : '권한 없음'});
  return res.redirect(`/contents/${content._id}`);
};

const isNotAuthorForAjax = async (req, res, next) => {
  
  const content = await Post.findById(req.params.contentNumber);

  if (!isSameUser(req, content)) {
    req.content = content;
    return next();
  }

  return res.end('fail');
};

 module.exports = { 
   isAuthor,
   isNotAuthor,
   isNotAuthorForAjax
};