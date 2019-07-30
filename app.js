const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const passportSetup = require('./config/passport-setup');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

const app = express();

// Controllers
const getHomepage = require('./controllers/getHomepage');
const getPostsNew = require('./controllers/getPostsNew');
const getPostsStore = require('./controllers/getPostsStore');
const getEachPost = require('./controllers/getEachPost');
const getRegister = require('./controllers/getRegister');
const postRegister = require('./controllers/postRegister');
const getLogin = require('./controllers/getLogin');
const postLogin = require('./controllers/postLogin');
const postGoogleAuth = require('./controllers/postGoogleAuth');
const getLogout = require('./controllers/getLogout');
const getEditedPost = require('./controllers/getEditedPost');
const postEditedPost = require('./controllers/postEditedPost');
const deletePost = require('./controllers/getDeletePost');
const getComment = require('./controllers/getComment');
const postComment = require('./controllers/postComment');
const deleteComment = require('./controllers/getDeletedComment');

// Middleware
const storePost = require('./middleware/storePost');
const authCheck = require('./middleware/verifyAuth');

dotenv.config();

mongoose
	.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useFindAndModify: true })
	.then(() => 'Now Connected to MongoDB')
	.catch(err => console.error(`Something went wrong ${err}`));

app.use(
	cookieSession({
		maxAge: 24 * 60 * 60 * 1000,
		keys: [process.env.cookieKey]
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', getHomepage);

app.get('/posts/new', authCheck, getPostsNew);
app.post('/posts/store', storePost, getPostsStore);
app.get('/post/:id', getEachPost);

app.get('/post/edit/:id', getEditedPost);
app.post('/post/edit/:id', postEditedPost);

app.get('/post/delete/:id', deletePost);

app.get('/auth/register', getRegister);
app.post('/auth/register', postRegister);

app.get('/auth/login', getLogin);
app.post('/auth/login', postLogin);

app.get('/auth/logout', getLogout);

app.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: ['profile']
	})
);
app.get('/auth/google/redirect', passport.authenticate('google'), postGoogleAuth);

app.get('/post/comment/:id', getComment);
app.post('/post/comment/:id', postComment);
app.get('/post/comment/delete/:id', deleteComment);

app.listen(4000, () => {
	console.log('App listening on port 4000');
});
