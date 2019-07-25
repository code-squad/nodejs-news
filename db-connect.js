const mongoose = require('mongoose');

module.exports = (config) => {
    mongoose.connect(config.dbURI, {useNewUrlParser: true});
    const db = mongoose.connection;
    db.on('open', () => {
        console.log('Connected to MongoDB');
    });

    db.on('error', (error) => {
        console.log(error);
    });
    return db;
}