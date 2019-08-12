const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	content: { type: String, required: true },
	commentPosterId: { type: mongoose.Types.ObjectId, required: true },
	postAuthorId: { type: mongoose.Types.ObjectId, required: true },
	commenter: { type: String, required: true },
	createdAt: {
		type: Date,
		default: new Date()
	}
});

const commentPost = mongoose.model('commentPost', commentSchema);


module.exports = commentPost;
