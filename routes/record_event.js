var express = require('express');
var router = express.Router();
var _ = require('lodash');
var userAgentParser = require('user-agent-parser');
var ipParser = require('ip-address')
var schema = require('../schemas/pageview');
var db = require('../db/analytics');
var errorHandler = require('../errors/error_handler');

router.post('/', function(req, res, next) {
  var data = _.pick(_.defaults(req.body, schema), _.keys(schema));
  var agentParser = new userAgentParser();
  data['user-browser'] = agentParser.setUA(data['user-agent']).getBrowser().name || null;

  var ip = new ipParser.Address4(data['user-IP']);
  data['user-IP'] = ip.bigInteger().toRadix();

  db.createPageViewRecord(data, function(err) { 
    if (err) {
      errorHandler.processError(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200); 
    }
  });
});

module.exports = router;
