const mongoose = require('mongoose');
const db = require('../config/database');

module.exports = () => {
    mongoose.connect(db.mongoURI, {useNewUrlParser: true })
        .then(() => console.log('Connected to MongoDB...'))
        .catch(() => console.error('Could not connect MongoDB'))
};
