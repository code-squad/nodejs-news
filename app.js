const express       = require('express');
const mongoose      = require('mongoose');
const bodyParser    = require('body-parser');
const morgan        = require('morgan');
const path          = require('path');

const config        = require('./config');

/* ==========================
    EXPRESS CONFIGURATION
============================= */
const app = express();
const port = process.env.PORT || 7777;

app.locals.pretty = true;

app.set('jwt-secret', config.secret);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.send('Server listen OK'));

app.listen(port, () => console.log(`Application server is running on port [ ${port} ]`))

/* ==============================
    CONNECT TO MONGODB
================================= */
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => console.log(`Mongodb server is connected`));
mongoose.connect(config.mongodbUri, { useNewUrlParser: true });