var express = require('express');
var router = express.Router();
//var oauth = require('./lib/oAuth/oauth');
var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('connected');
});

router.get('/', function(req, res) {
		redisClient.get((req.orgid + req.userid), function(err, reply){
			console.log('reply --> '+reply);
			req.app.locals.oauthtoken = reply;
		});
	    res.render('pages/home', {
	    	oauthtoken: req.app.locals.oauthtoken,
	        ouathLightningURL: req.app.locals.lightningEndPointURI
    });
});

module.exports = router;