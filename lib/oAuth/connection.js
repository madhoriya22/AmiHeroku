"use strict";
var nforce = require('nforce');

var connection = {};

var org = nforce.createConnection({
	clientId: '3MVG9uudbyLbNPZNJEXZMB2pRF0eU7QaY71uMxSWgT5aiKSgzAFhJsFmNjdOA_2oXp9XPygiWx2mvOU7vBayD',
	clientSecret: '5679132849215277353',
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
