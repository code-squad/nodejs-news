const mongoose = require('mongoose');

const clickedSchema = new mongoose.Schema({
	clicker: { type: mongoose.Types.ObjectId, required: true },
	clickedPost: { type: mongoose.Types.ObjectId, required: true },
	createdAt: {
		type: Date,
		default: new Date()
	}
});

const clickedPost = mongoose.model('clickedPost', clickedSchema);

module.exports = clickedPost;
