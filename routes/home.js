var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	console.log('access token from redis '+req.session.oauthtoken);
	console.log('url from redis '+req.session.sfdcUrl);
	    res.render('pages/home', {
	    	oauthtoken: req.app.locals.oauthtoken,
	        ouathLightningURL: req.app.locals.lightningEndPointURI
    });
});

module.exports = router;