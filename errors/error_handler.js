var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'file', filename: 'logs/error.log' }
  ]
});

var errorHandler = {
    processError: function (err) {
        var log = log4js.getLogger();
        log.error(err);
    }
}

module.exports = errorHandler;
