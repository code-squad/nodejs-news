const mongoose = require('mongoose');
const crypto = require('crypto');
const { secret } = require('../configs/config')
const Schema = mongoose.Schema;

const User = new Schema({
    email: { 
        type: String,
        required: true,
        unique: true
    },
    password: { 
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    authority: {
        type: String,
        default: 'member'
    }
});

User.statics.create = function (email, password, nickname) {
    const encrypted = crypto.createHmac('sha1', secret)
    .update(password)
    .digest('base64');

    const user = new this({ email, password: encrypted, nickname });
    
    return user.save();
}

User.statics.findOneByEmail = function(email) {
    return this.findOne({
        email
    }).exec()
}

User.methods.verify = function(password) {
    const encrypted = crypto.createHmac('sha1', secret)
                      .update(password)
                      .digest('base64')

    return this.password === encrypted
}

module.exports = mongoose.model('User', User);