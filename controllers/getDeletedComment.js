const Comment = require('../models/comment');
const jwtDecode = require('jwt-decode');

module.exports = async (req, res) => {
	const comment = await Comment.findById(req.params.id);
	console.log('aaa', comment.postAuthorId);

	async function deleteDocumentById(id) {
		await Comment.deleteOne({ _id: id }, (err, commentInfo) => {
			console.log('Hello world');
			if (err) return res.status(500).send('Fail to delete');
			res.status(200).redirect(`/post/comment/${comment.postAuthorId}`);
		});
	}

	if (req.cookies.auth_token) {
		const token = req.cookies.auth_token;
		const decoded = jwtDecode(token);
		decodedData = {
			_id: decoded._id
		};
		if (JSON.stringify(decodedData._id) === JSON.stringify(comment.commentPosterId)) {
			deleteDocumentById(comment._id);
		} else {
			res.status(401).send('Unauthorized Access');
		}
	} else if (req.user) {
		if (JSON.stringify(req.user._id) == JSON.stringify(comment.commentPosterId)) {
			deleteDocumentById(comment._id);
		} else {
			res.status(401).send('Unauthorized Access');
		}
	} else {
		res.status(401).send('Unauthorized Access');
	}
};
