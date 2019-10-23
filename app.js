const createError = require('http-errors');
const express = require('express');
const path = require('path');

const apiRouter = require('./controllers/api');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api', apiRouter);



// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;