const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const ArticleSchema = mongoose.model('articles', new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    field: {
        type: String,
        required: true
    },
    press: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'http://placehold.it/900x300'
    },
    comments: [{
        commentBody: {
            type: String,
            required: true
        },
        commentDate: {
            type: Date,
            default: Date.now
        },
        commentUser: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    }],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes_count: {
        type: Number,
        default: 0
    },
    likesUser: {
        type: Array,
        default: []
    }
}));

// Create collection and add schema
module.exports = ArticleSchema;
