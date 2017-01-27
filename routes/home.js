var express = require('express');
var router = express.Router();
var oauth = require('./lib/oAuth/oauth');

oauth.redisClient.get((req.ordid + req.userid), function(err, reply){
	req.app.locals.oauthtoken = reply;
});

router.get('/', function(req, res) {
	    res.render('pages/home', {
	    	oauthtoken: req.app.locals.oauthtoken,
	        ouathLightningURL: req.app.locals.lightningEndPointURI
    });
});

module.exports = router;