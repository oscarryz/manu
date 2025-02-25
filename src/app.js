// const createError = require('http-errors');
const express = require("express");
const path = require("path");

const api = require("./controllers/api");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../generated")));

app.get("/", api.first);
app.get("/new", api.get);
app.get("/edit/:id", api.get);
app.post("/api", api.post);
app.put("/api", api.put);

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  console.log(err);
  res.status(err.status || 500);
  res.send("An error occurred. Check logs for details");
});

module.exports = app;
