var express = require('express');
var ipParser = require('ip-address');
var db = require('../db/analytics');
var errorHandler = require('../errors/error_handler');
var router = express.Router();

router.use(function(req, res, next){
    if(req.headers['authorization'] == 'VERY_SECRET_PASSWORD'){
        next();
    } else {
        res.sendStatus(401);
    }
});

router.get('/bypage/:id?', function(req, res, next) {
    db.getPageViewsByPageId(req.params.id, function(err, result) { 
        sendResponseData(req, res, next, err, result);
    });
});

router.get('/bybrowser/:id?', function(req, res, next) {
    db.getPageViewsByBrowser(req.params.id, function(err, result) { 
        sendResponseData(req, res, next, err, result);
    });
});

router.get('/bycountry/:id?', function(req, res, next) {
    db.getPageViewsByCountry(req.params.id, function(err, result) { 
        sendResponseData(req, res, next, err, result);
    });
});

var sendResponseData = function (req, res, next, err, data){
    if (err) {
        errorHandler.processError(err);
        res.sendStatus(500);
        return;
    }

    if (data){
        data.forEach(function(el) {
            if (el['user-ip']){
                var ip = ipParser.Address4.fromInteger(el['user-ip']);
                el['user-ip'] = ip.correctForm();
            } 
        }, this);
    }

    res.send(data || []);
}

module.exports = router;