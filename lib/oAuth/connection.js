"use strict";
var nforce = require('nforce');

var connection = {};

var org = nforce.createConnection({
	clientId: '3MVG9ZL0ppGP5UrCRjpnQYHDCHwkg.g_J1iaOmb9I9.pM8190F7c2K.PNiAJvkwnr0fENPkVmHx8Bz0tVOdsH',
	clientSecret: '8836749207307542427',
	redirectUri: 'https://ltng-out-sample-2.herokuapp.com/oauthcallback',
	apiVersion: 'v38.0',  // optional, defaults to current salesforce API version
	environment: 'production',  // optional, salesforce 'sandbox' or 'production', production default
	mode: 'multi', // optional, 'single' or 'multi' user mode, multi default
});

//the above equals to the following
connection.getOrg = function(){
	return org;
};

module.exports = connection;
