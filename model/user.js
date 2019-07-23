const mongoose = require('mongoose');

const User = mongoose.model('users', new mongoose.Schema({
    email: {
        type: String,
        minlength: 2,
    },
    name: {
        type: String,
        minlength: 2,
    },
    password: {
        type: String,
        minlength: 2,
    },
    date: {
      type: Date,
      default: Date.now
    },
    github:{
        id: String,
        token: String,
        name: String,
        image: String
    },
    google:{
        id: String,
        email: String,
        name: String,
        image: String
    },
    admin:{
        type: Boolean,
        default: false
    }
}));

module.exports = User;