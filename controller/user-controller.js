const generateJWTToken = require('../utils/jwt-token-generator');
const User = require('../model/user');
const Post = require('../model/post');
const passport = require('passport');
require('../auth/passport').setup()

const userController = {

  addUser : (req, res, next) => {
    try {
      passport.authenticate('signup', {
        session : false
      }, async (err, user, info) => {
  
        req.flash('message', info.message)
        
        if (!user) {
          return res.redirect('/signup')
        }
  
        // 회원가입 후 자동 로그인 : jwt 토큰 생성 후 메인 페이지로 리다이렉트 
        await generateJWTToken(res, user);
        return res.redirect('/');
      
      })(req, res, next)

    } catch (error) {
      next(error)
    }
  },

  deleteUser : async (req, res, next) => {
    try {
      await User.deleteOne({username : req.user.username});
      res.clearCookie('token', { path: '/' })
      res.end('success');
    } catch (error) {
      next(error);
    }
  },

  updateUser : async (req, res, next) => {

    try {
      let user = await User.findOne().or([{ username : req.params.usernameOrOauthId }, { 'auth.googleId' : req.params.usernameOrOauthId}])
                            .populate({path : 'posts'})
                            .populate({path : 'comments'})
      
      if (req.files.length > 0) {
        req.body.profilePhoto = req.files[0].location
      }
      
      Object.assign(user, req.body);

      user.posts.forEach(async (post) => {
        post.author = user;
        await post.save();
      })

      user.comments.forEach(async (comment) => {
        const existPost = await Post.findById({_id : comment.postId});
        if (existPost) {
          existPost.comments.forEach(async (postComment) => {
            postComment.userAvatar = user.profilePhoto;
            await postComment.save();
          })
        }
        await existPost.save();
      })

      await user.save();
      return res.end('success');
    } catch (error) {
      next(error);
    }
  },

  getSettingsPage : async (req, res) => {
    
    let user;
    if (req.user) {
      user = await User.findById(req.user._id);
    }

    res.render('settings', {
      title: 'Settings | Daily Frame',
      user : user,
    });
  },

  getInitSettingsPage : (req, res) => {
    res.render('initSettings', {
      title: 'Settings | Daily Frame',
      user : req.user,
      message : req.flash('message')
    });
  },

  getLikesPage : async (req, res, next) => {
    try {
      const author = await User.findOne({username : req.params.username}).populate({path : 'likePosts'});
      const posts = [];
      Array.from(author.likePosts).filter(val => val[1].display === true)
                                  .forEach(post => posts.push(post[1]));
  
      let user;
      if (req.user) {
        user = await User.findById(req.user._id);
      }
  
      res.render('likes', {
        title: 'likes | Daily Frame',
        user,
        posts,
        author
      });
    } catch (error) {
      next(error);
    }
    }
}

module.exports = userController;