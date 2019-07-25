const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const articleSchema = new articleSchma({
    writer: {
        type: ObjectId,
        required: true,
        ref: 'User',
    },
    articleNumber: {
        type: Number,
        required: true,
    },
    // content: {
    //     type: String,

    // },
    like: {
        type: Number,
        required: true,
        default: 0,
    },
    comments: {
        type: Array,
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = monggose.model('Article', articleSchema);