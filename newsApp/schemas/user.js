const mongoose = require('mongoose');

let User = mongoose.model('User', new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  privilege: {
    type: String,
    required: true
  },
}));

let Report = mongoose.model('Report', new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  contents: {
    type: String
  },
  comments: {
    type: String
  },
  commentsGood: {
    type: Number
  }
}));

module.exports = User