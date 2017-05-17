var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var guid = require('guid');
var responseTime = require('response-time');
var ip = require('ip');
var request = require('request');
var errorHandler = require('./errors/error_handler');

var record = require('./routes/record_event');
var views = require('./routes/get_views');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//propagate request-id to response
app.use(function(req, res, next){
  var id = req.headers['request-id'];
  res.append('request-id', id || guid.raw());
  next();
});

//post to billing service
app.use(responseTime(function (req, res, time) {
  if (res.statusCode != 200){
    return;
  }

  var data = {
    clientIP: req.connection.remoteAddress,
    clientUserAgent: req.headers['user-agent'],
    ip: ip.address(),
    callTime: time
  };

  var options = {
    url: 'http://api.playbuzz.com/eventrepoter-exercise',
    headers: {
      'request-id': res.getHeader('request-id') || guid.raw()
    },
    form: data
  };

  request.post(options, function(err, response, body) {
    console.log(response.statusCode);
  });
}))

app.use('/recordevent/', record);
app.use('/views/', views);

//send 401 for everything else
app.use(function(req, res, next) {
  res.sendStatus(401);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  errorHandler.processError(err);
  res.sendStatus(500);
});

process.on('uncaughtException', function(err){
  errorHandler.processError(err);
});

module.exports = app;
