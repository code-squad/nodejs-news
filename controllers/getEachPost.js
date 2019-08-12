// homepage에 있는 기사를 클릭했을때 full article 정보를 보여주는 부분.
const Post = require('../models/Post');

module.exports = async (req, res) => {
	const post = await Post.findById(req.params.id);
	res.render('post', {
		post
	});
};
