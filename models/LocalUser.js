const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const localUserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		min: 6,
		max: 255
	},
	email: {
		type: String,
		required: true,
		max: 255,
		min: 6
	},
	password: {
		type: String,
		required: true,
		max: 1024,
		min: 6
	},

	isAdmin: Boolean
});

const localUser = mongoose.model('localUser', localUserSchema);

// Function to validate User
function registerValidation(user) {
	const schema = {
		name: Joi.string().required(),
		email: Joi.string()
			.min(6)
			.required()
			.email(),
		password: Joi.string()
			.min(6)
			.required(),
		repeatPassword: Joi.any()
			.equal(Joi.ref('password'))
			.required()
	};

	return Joi.validate(user, schema);
}

function loginValidation(user) {
	const schema = {
		email: Joi.string()
			.min(6)
			.required(),
		password: Joi.string()
			.min(6)
			.required()
	};
	
	return Joi.validate(user, schema);
}

module.exports = {
	localUser,
	registerValidation,
	loginValidation
};
