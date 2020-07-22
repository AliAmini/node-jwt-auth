const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const config = require('./config/database');

// MongoDB
mongoose.connect(config.database, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const api = require('./routes/api'); 
const indexRoutes = require('./routes/index'); 
const sellerRoutes = require('./routes/seller'); 


const app = express();

// view engine setup
// -- define ejs engine
const engine = require('ejs-locals');
app.engine('ejs', engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(passport.initialize());


// ========= LOCALS ========== \\

app.locals.title =  "";
app.all('*', function(req, res, next){
    // console.log('PRE '+req.method, req.url);

    next();
});


// Routse

app.use('/', indexRoutes);
app.use('/api', api);
app.use('/api/seller', sellerRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;

    console.log("404 ERROR: ", err);
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');

    console.log("500 ERROR: ", err);
});

module.exports = app;