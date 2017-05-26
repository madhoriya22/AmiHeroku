"use strict";
var express = require('express');
var oauth = require('./lib/oAuth/oauth');
var port = process.env.PORT || 3000;

var app = express()
, sessions = require('./lib/Services/sessions.js');

app.use(sessions.createSession());

// Require Routes js
var routesHome = require('./routes/home');
//message to cipher 
var message = 'Test';

// Serve static files
app.use(express.static(__dirname + '/public'));

app.use('/home', routesHome);
 
app.set('view engine', 'ejs');

app.get('/', function(req, res){
	oauth.redirectToHome(req, res, app);
	message = req.session.accesstoken;
	 console.log("OAuth token ==>>  "+message);
	res.redirect('/home?renId='+req.query.renId);
});

app.get('/accesstoken', function(req, res){
	console.log('Redis Session - '+JSON.stringify(req.session));
	oauth.redirectToHome(req, res, app);
});

app.get('/oauthcallback', function(req, res) {
	console.log('oauthcallback call');
	oauth.authenticate(req, res, app);
});

app.get('/renewUserAccess', function(req, res) {
	console.log('renewUserAccess call');
	req.session.sfdcurl = req.query.sfdcurl;
	oauth.redirectAuthURI(res);
});

app.get('/revokeAccess', function(req, res) {
	console.log('revokeAccess call');
	oauth.revokeAccess(req,res);
});

//import crypto module to generate random binary data 
var crypto = require('crypto');
 
// generate random passphrase binary data 
var r_pass = crypto.randomBytes(128);
 
// convert passphrase to base64 format 
var r_pass_base64 = r_pass.toString("base64");
 
console.log("passphrase base64 format: ");
console.log(r_pass_base64);

//import node-cryptojs-aes modules to encrypt or decrypt data 
var node_cryptojs = require('node-cryptojs-aes');
 
// node-cryptojs-aes main object; 
var CryptoJS = node_cryptojs.CryptoJS;
 
// custom json serialization format 
var JsonFormatter = node_cryptojs.JsonFormatter;
 

// encrypt plain text with passphrase and custom json serialization format, return CipherParams object 
// r_pass_base64 is the passphrase generated from first stage 
// message is the original plain text   
 
var encrypted = CryptoJS.AES.encrypt(message, r_pass_base64, { format: JsonFormatter });
 
// convert CipherParams object to json string for transmission 
var encrypted_json_str = encrypted.toString();
 
console.log("serialized CipherParams object: ");
console.log(encrypted_json_str);

//create custom json serialization format 
var JsonFormatter = {
    stringify: function (cipherParams) {
        // create json object with ciphertext 
        var jsonObj = {
            ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
        };
        
        // optionally add iv and salt 
        if (cipherParams.iv) {
            jsonObj.iv = cipherParams.iv.toString();
        }
        
        if (cipherParams.salt) {
            jsonObj.s = cipherParams.salt.toString();
        }
 
        // stringify json object 
        return JSON.stringify(jsonObj)
    },
 
    parse: function (jsonStr) {
        // parse json string 
        var jsonObj = JSON.parse(jsonStr);
        
        // extract ciphertext from json object, and create cipher params object 
        var cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
        });
        
        // optionally extract iv and salt 
        if (jsonObj.iv) {
            cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
        }
            
        if (jsonObj.s) {
            cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
        }
        
        return cipherParams;
    }
};

//browser request serialized cipherParams object in path /crypto/encrypted, with JSONP support 
app.get('/crypto/encrypted', function(request, response) {
 
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