const mongoose = require('mongoose');
const crypto   = require('crypto'); 

const Schema = mongoose.Schema;
const userSchema = new Schema({
    username    : String,
    salt        : String,
    password    : String,
    nickname    : String,
    comment     : [ String ],
    admin       : { type : Boolean, default : false }
});

const generateSalt = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, encryptKey) => {
            if (err) reject(err);
            resolve(encryptKey.toString('base64'));
        });
    });
};

const generateEncryption = (salt, password) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 108236, 64, 'sha512', (err, encrypted) => {
            if (err) reject(err);
            resolve(encrypted.toString('base64'));
        });
    });
}

userSchema.statics.register = async function(userInfo) {
    const salt      = await generateSalt();
    const encrypted = await generateEncryption(salt, userInfo.password);
    const userCount = await this.countDocuments({}).exec();
    const user      = new this({ 
        username : userInfo.username, 
        salt     : salt, 
        password : salt + '.' + encrypted,
        nickname : userInfo.nickname,
        admin    : (!userCount) ? true : false
    });
    return user.save();
}

userSchema.statics.findOneByUsername = async function(username) {
    return this.findOne({ username }).exec();
}

userSchema.statics.count = async function() {
    return this.countDocuments({}).exec();
}

module.exports = mongoose.model('User', userSchema);