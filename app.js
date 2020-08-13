var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var db = mongoose.connection;
var bodyParser = require('body-parser');


var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var expertRouter = require("./routes/experts");
var communityRouter = require("./routes/community");
var adminRouter = require("./routes/admin");
var farmerRouter = require("./routes/farmer");
var plantRouter = require('./routes/plants');
var pestRouter = require('./routes/pests');
var diseaseRouter = require('./routes/diseases');
var cureRouter = require('./routes/cures');

var dbUrl = "mongodb+srv://dbAdmin:adminPassword@cluster0-7nmav.gcp.mongodb.net/smartfarming?retryWrites=true&w=majority";
db.on("error", function() {
  console.log("there was an error communicating with the database");
});

mongoose.connect(dbUrl, function(err) {
  if (err) {
    return console.log("there was a problem connecting to the database!" + err);
  }
});

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("./uploads"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/expert", expertRouter);
app.use("/community", communityRouter);
app.use("/farmer", farmerRouter);
app.use("/admin", adminRouter);
app.use("/plant", plantRouter);
app.use("/pest", pestRouter);
app.use("/disease", diseaseRouter);
app.use("/cure", cureRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;