const passportLocalMongoose = require('passport-local-mongoose');
const mongoose              = require('mongoose');
const Schema                = mongoose.Schema;

const userSchema = new Schema({
    user_id     : String,
    user_pw     : String,
    user_name   : String,
    user_e_mail : String,
    comment     : [ String ],
    admin       : { type : Boolean, default : false }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);