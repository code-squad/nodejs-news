const Post = require('../models/Post');
const path = require('path');

module.exports = (req, res) => {
	const { image } = req.files;

	image.mv(path.resolve(__dirname, '..', 'static/posts', image.name), error => {
		Post.findByIdAndUpdate(req.params.id, { ...req.body, image: `/posts/${image.name}` }, (error, post) => {
			res.redirect('/');
		});
	});
};
