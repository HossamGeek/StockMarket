const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const usersRouter = require('./controllers/users');
const assetsRouter = require('./controllers/assets');
const session = require('express-session');
const mongoose = require('mongoose');
//const PORT = process.env.port || 3000;
mongoose.connect('mongodb://stockmarcket:SM123456789@ds219191.mlab.com:19191/stockmarket');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret:"@#%#$^$%",
    cookie:{maxAge:1000*60*60*7*24}
}));


app.get('/', function(req, res) {
 res.redirect('/assets/allassets');
});

app.use('/users', usersRouter);
app.use('/assets', assetsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

/*
app.listen(PORT,function () {
   console.log("starting...");
});
*/
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

