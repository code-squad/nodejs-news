const Joi = require('joi');
const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    email: {
        type: String,
        // required: true,
        minlength: 2,
    },
    name: {
        type: String,
        minlength: 2,
    },
    password: {
        type: String,
        // required: true,
        minlength: 2,
    },
    github: {
        id: String,
        token: String,
        email: String,
        name: String
    }
}));

function validateUser(user) {
    const schema = {
        username: Joi.string().min(2).required(),
        password: Joi.string().min(2).required(),
    };

    return Joi.validate(user, schema);
}

module.exports = {
    User,
    validateUser
};