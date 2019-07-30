const path = require('path');
const Post = require('../models/Post');
const jwtDecode = require('jwt-decode');

module.exports = (req, res) => {
	const { image } = req.files;
	// req.uesr 구글의 경우 존재함
	if (req.cookies.auth_token) {
		const token = req.cookies.auth_token;
		const decoded = jwtDecode(token);
		const decodedData = {
			_id: decoded._id
		};
		image.mv(path.resolve(__dirname, '..', 'public/posts', image.name), error => {
			Post.create(
				{
					...req.body,
					writerId: decodedData._id,
					image: `/posts/${image.name}`
				},
				(error, post) => {
					res.redirect('/');
				}
			);
		});
	} else {
		image.mv(path.resolve(__dirname, '..', 'public/posts', image.name), error => {
			Post.create(
				{
					...req.body,
					writerId: req.user._id,
					image: `/posts/${image.name}`
				},
				(error, post) => {
					res.redirect('/');
				}
			);
		});
	}
};
