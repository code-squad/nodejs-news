const mongoose = require('mongoose');
const crypto   = require('crypto'); 

const Schema = mongoose.Schema;
const userSchema = new Schema({
    email       : String,
    salt        : String,
    password    : String,
    nickname    : String,
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
        email    : userInfo.email, 
        salt     : salt, 
        password : encrypted,
        nickname : userInfo.nickname,
        admin    : (!userCount) ? true : false
    });
    return user.save();
}

userSchema.statics.findOneByEmail = async function(email) {
    return this.findOne({ email }).exec();
}

userSchema.methods.verify = async function(password) {
    const encrypted = await generateEncryption(this.salt, password);
    return this.password === encrypted;
}

module.exports = mongoose.model('User', userSchema);