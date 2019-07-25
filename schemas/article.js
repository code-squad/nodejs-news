const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId } } = Schema;
const articleSchma = new articleSchma({
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
    }
})