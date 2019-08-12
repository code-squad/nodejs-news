const mongoose = require('mongoose');

const googleUserSchema = new mongoose.Schema({
	username: {
		type: String
	},
	googleId: {
		type: String
	},
	thumbnail: {
		type: String
	}
});

const googleUser = mongoose.model('googleUser', googleUserSchema);

module.exports = googleUser;
