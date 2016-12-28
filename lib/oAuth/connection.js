"use strict";
var nforce = require('nforce');

var connection = {};

var org = nforce.createConnection({
	clientId: '3MVG9YDQS5WtC11r7b5WV5z0PmcuptSY8YAZbXPNzzcLnhlRgmwL8Qx75OaaGCEU74YLeyRJJEIgnx6lo.zUM',
	clientSecret: '1937170743896560804',
	redirectUri: process.env.REDIRECT_URI,
	apiVersion: 'v38.0',  // optional, defaults to current salesforce API version
	environment: 'production',  // optional, salesforce 'sandbox' or 'production', production default
	mode: 'multi', // optional, 'single' or 'multi' user mode, multi default
});

//the above equals to the following
connection.getOrg = function(){
	return org;
};

module.exports = connection;
