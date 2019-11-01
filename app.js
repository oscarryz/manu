const createError = require('http-errors');
const express = require('express');
const path = require('path');

const api = require('./controllers/api');
const entries = require('./controllers/entries');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'generated')));

app.post('/api', api);
app.get('/entries', entries);




// error handler
app.use(function(err, req, res, next) {
  // render the error page
  console.log(err);
  res.status(err.status || 500);
  res.send('An error occurred. Check logs for details');
});

module.exports = app;