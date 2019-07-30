const CommentPost = require('../models/comment');

module.exports = async (req, res) => {
	const Comment = await CommentPost.find({ postAuthorId: req.params.id });

	res.render('comment', { user: req.params.id, Comment });
};
