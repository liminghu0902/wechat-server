
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const userRouter = require('./controller/user');
const wxRouter = require('./controller/wx');


app.use(express.static(__dirname + '/public'));

app.use(bodyParser.xml({
    xmlParseOptions: {
        normalize: true,
        explicitArray: false
      }
}));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
    origin: ['http://localhost:8080']
}));

app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use('/', userRouter);
app.use('/', wxRouter);


app.listen(8088, '127.0.0.1');
