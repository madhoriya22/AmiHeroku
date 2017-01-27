"use strict";
var express = require('express');
var oauth = require('./lib/oAuth/oauth');
var port = process.env.PORT || 3000;

var app = express();

// Require Routes js
var routesHome = require('./routes/home');

// Serve static files
app.use(express.static(__dirname + '/public'));

app.use('/home', routesHome);
 
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	
	oauth.redirectToHome(req, res, app);
	//oauth.redirectAuthURI(res);
});

app.get('/oauthcallback', function(req, res) {
	console.log('oauthcallback call');
	oauth.authenticate(req, res, app);
});

app.get('/renewUserAccess', function(req, res) {
	console.log('renewUserAccess call');
	app.locals.lightningEndPointURI = req.query.sfdcUrl;
	oauth.redirectAuthURI(res);
});

app.get('/revokeAccess', function(req, res) {
	console.log('revokeAccess call');
	oauth.revokeAccess(req,res);
});
// Served Localhost
console.log('Served: '+process.env.HOST + port);
app.listen(port);