"use strict";
var newrelic = require('newrelic');
var express = require('express');
var oauth = require('./lib/oAuth/oauth');
var port = process.env.PORT || 3000;

var app = express()
, sessions = require('./lib/Services/sessions.js');

app.use(sessions.createSession());

/*Allow CORS*/
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization'); 
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
	  
	next();
});

// Require Routes js
var routesHome = require('./routes/home');

// Serve static files
app.use(express.static(__dirname + '/public'));

app.use('/home', routesHome);

app.set('view engine', 'ejs');
	
app.get('/', function(req, res, next){
	oauth.getCommunityURL(req,res);
	//oauth.redirectToHome(req, res, app);
});

app.get('/authenticate', function(req, res, next){
	oauth.redirectToHome(req, res, app);
});

app.get('/accesstoken', function(req, res, next){
	console.log('Redis Session - '+JSON.stringify(req.session));
	oauth.redirectToHome(req, res, app);
});

app.get('/oauthcallback', function(req, res, next) {
	console.log('oauthcallback call');
	oauth.authenticate(req, res, app);
});

app.get('/renewUserAccess', function(req, res, next) {
	console.log('renewUserAccess call : '+req.query.env);
	req.session.sfdcurl = req.query.sfdcurl;
	req.session.env = req.query.env;
	req.session.communityUrl = req.query.communityUrl;
	oauth.redirectAuthURI(res,req);
});

app.get('/revokeAccess', function(req, res, next) {
	console.log('revokeAccess call');
	oauth.revokeAccess(req,res);
});
// Served Localhost
//console.log('Served: http://localhost:' + port);

app.listen(port);
