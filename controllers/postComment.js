const jwtDecode = require('jwt-decode');
const CommentPost = require('../models/comment');

module.exports = async (req, res) => {
	// console.log(req.body);
	// console.log('sdsd', req.params.id);
	if (req.cookies.auth_token) {
		const token = req.cookies.auth_token;
		const decoded = jwtDecode(token);
		const decodedData = {
			name: decoded.name,
			id: decoded._id
		};
		CommentPost.create(
			{
				content: req.body.comment,
				commentPosterId: decodedData.id,
				postAuthorId: req.params.id,
				commenter: decodedData.name
			},
			(error, post) => {
				if (error) {
					res.send(error);
				} else {
					res.redirect(`/post/comment/${req.params.id}`);
				}
			}
		);
	} else if (req.user) {
		const googleUserData = {
			googleId: req.user._id,
			username: req.user.username
		};
		CommentPost.create(
			{
				content: req.body.comment,
				commentPosterId: googleUserData.googleId,
				postAuthorId: req.params.id,
				commenter: googleUserData.username
			},
			(error, post) => {
				if (error) {
					res.send(error);
				} else {
					res.redirect(`/post/comment/${req.params.id}`);
				}
			}
		);
	} else {
		res.status(401).send('Unauthorized Access!');
	}
};
