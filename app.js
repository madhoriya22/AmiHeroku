"use strict";
var newrelic = require('newrelic');
var express = require('express');
var oauth = require('./lib/oAuth/oauth');
var port = process.env.PORT || 3000;

var app = express()
, sessions = require('./lib/Services/sessions.js');

app.use(sessions.createSession());

// Require Routes js
var routesHome = require('./routes/home');


//import crypto module to generate random binary data 
var crypto = require('crypto');

//generate random passphrase binary data 
var r_pass = crypto.randomBytes(128);

//convert passphrase to base64 format 
var r_pass_base64 = r_pass.toString("base64");

//import node-cryptojs-aes modules to encrypt or decrypt data 
var node_cryptojs = require('node-cryptojs-aes');

//node-cryptojs-aes main object; 
var CryptoJS = node_cryptojs.CryptoJS;

//custom json serialization format 
var JsonFormatter = node_cryptojs.JsonFormatter;

var encrypted;

//convert CipherParams object to json string for transmission 
var encrypted_json_str;


// Serve static files
app.use(express.static(__dirname + '/public'));

app.use('/home', routesHome);
 
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	oauth.redirectToHome(req, res, app);
	
	
});

app.get('/accesstoken', function(req, res){
	console.log('Redis Session - '+JSON.stringify(req.session));
	oauth.redirectToHome(req, res, app);
});

app.get('/oauthcallback', function(req, res) {
	console.log('oauthcallback call'+req.session.env);
	oauth.authenticate(req, res, app);
});

app.get('/renewUserAccess', function(req, res) {
	console.log('renewUserAccess call : : '+req.query.env);
	req.session.sfdcurl = req.query.sfdcurl;
	req.session.env = req.query.env;
	oauth.redirectAuthURI(res,req);
});

app.get('/revokeAccess', function(req, res) {
	console.log('revokeAccess call');
	oauth.revokeAccess(req,res);
});

 

//browser request serialized cipherParams object in path /crypto/encrypted, with JSONP support 
app.get('/crypto/encrypted', function(request, response) {
	//oauth.getAccessTokenInRes(request, response, app);
	encrypted = CryptoJS.AES.encrypt(request.session.accesstoken, r_pass_base64, { format: JsonFormatter });
	encrypted_json_str = encrypted.toString();
	//JSONP allow cross domain AJAX 
    response.jsonp({
        encrypted : encrypted_json_str
    });
 
});
 
// browser request passphrase in path /crypto/passphrase, with JSONP support 
app.get('/crypto/passphrase', function(request, response) {
 
    //JSONP allow cross domain AJAX 
    response.jsonp({
        passphrase : r_pass_base64
    });
 
});



// Served Localhost
console.log('Served: http://localhost:' + port);
app.listen(port);