const Post = require('../models/Post');
const jwtDecode = require('jwt-decode');

module.exports = async (req, res) => {
	const post = await Post.findById(req.params.id);

	async function deleteDocumentById(id) {
		await Post.findByIdAndRemove(id, function(err, user) {
			if (err) return res.status(500).send('Fail to Delete');
			res.status(200).redirect('/');
		});
	}

	if (req.cookies.auth_token) {
		const token = req.cookies.auth_token;
		const decoded = jwtDecode(token);
		decodedData = {
			_id: decoded._id
		};
		if (JSON.stringify(decodedData._id) === JSON.stringify(post.writerId)) {
			deleteDocumentById(req.params.id);
		} else {
			res.status(401).send('Unauthorized Access');
		}
	} else if (req.user) {
		if (JSON.stringify(req.user._id) == JSON.stringify(post.writerId)) {
			deleteDocumentById(req.params.id);
		} else {
			res.status(401).send('Unauthorized Access');
		}
	} else {
		res.status(401).send('Unauthorized Access');
	}
};
