var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var sql = require('./helper/database');

var indexRouter = require('./routes/index');
var stockRouter = require('./routes/stock');
var customerRouter = require('./routes/customer');
var invoiceRouter = require('./routes/invoice');

var app = express();

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  allowedHeaders: ['Authorization', 'Content-Type'],
}));


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/stock', stockRouter);
app.use('/api/customer', customerRouter);
app.use('/api/invoice', invoiceRouter);

app.use((req, res, next) => {
  res.send(`<h1>Route Not Found </h1>`);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('500 error');
});

const db_port = sql.options.port;
const api_port = process.env.API_PORT;

sql.connect((err) => {
  if(err) throw err;
  console.log(`Database Server is running on port ${db_port}`);
})

app.listen(() => {
  console.log(`API Server is running on port ${api_port}`);
});

module.exports = app;
