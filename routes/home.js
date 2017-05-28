var express = require('express');
var router = express.Router();
//import crypto module to generate random binary data 
var crypto = require('crypto');
 
// generate random passphrase binary data 
var r_pass = crypto.randomBytes(128);
 
// convert passphrase to base64 format 
var r_pass_base64 = 'D6sNp0SlPO';

//import node-cryptojs-aes modules to encrypt or decrypt data 
var node_cryptojs = require('node-cryptojs-aes');
 
// node-cryptojs-aes main object; 
var CryptoJS = node_cryptojs.CryptoJS;
 
// custom json serialization format  
var JsonFormatter = node_cryptojs.JsonFormatter;


router.get('/', function(req, res) {
	console.log('access token from redis '+req.session.accesstoken);
	console.log('url from redis '+req.session.sfdcurl);
	var encrypted = CryptoJS.AES.encrypt(request.app.locals.oauthtoken, r_pass_base64, { format: JsonFormatter });
    console.log("Acc"+request.app.locals.oauthtoken +" Encrypt "+encrypted);
    encrypted_json_str = encrypted.toString();
    
	res.render('pages/home', {
	    	accesstoken: encrypted_json_str,
	    	sfdcurl: req.session.sfdcurl,
	    	orgid: req.session.orgid,
	    	namespace: process.env['SF_NAMESPACE'],
	    	idletime: process.env['SESSION_IDLE_TIME']
    });
});


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



module.exports = router;