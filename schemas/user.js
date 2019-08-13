const mongoose = require('mongoose');

const { Schema } = mongoose;
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    userType: {
        type: String,
        required: true,
    },
    
    articles: {
        type: Array,
        default: [],
    },
    comments: {
        type: Array,
        default: [],
    },
    provider: {
        type: String,
        required: true,
        default: 'local',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('User', userSchema);