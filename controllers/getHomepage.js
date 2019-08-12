const Post = require('../models/Post');
const jwtDecode = require('jwt-decode');
const ClickedPost = require('../models/clicked');

module.exports = async (req, res) => {
	const clickedPost = await ClickedPost.find({});
	console.log('ADSA', clickedPost);
	const posts = await Post.find({});
	if (req.cookies.auth_token) {
		const token = req.cookies.auth_token;
		const decoded = jwtDecode(token);
		const decodedData = {
			_id: decoded._id
		};
		res.render('homepage', { posts, user: decodedData });
	} else {
		res.render('homepage', {
			posts,
			user: req.user
		});
	}
};
