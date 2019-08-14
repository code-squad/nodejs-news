const mongoose = require('mongoose');
const database = require('../config/database');

module.exports = () => {
    const db = database.mongoURI;
    mongoose.connect(db, {useNewUrlParser: true })
        .then(() => console.log(`Connected to ${db}...`))
        // .catch(() => console.error(`Could not connect to ${db}`))
};
