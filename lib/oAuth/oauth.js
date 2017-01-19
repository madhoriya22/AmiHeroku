"use strict";

var connection = require('./connection'),
	knex = require('../Services/db').knex;
var oauth = {};

oauth.authenticate = function(req, res, app) {
	console.log('before oauth - '+req.query.code);
	connection.getOrg().authenticate({code: req.query.code}, function(err, resp){
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			app.locals.oauthtoken = resp.access_token;
			app.locals.refreshtoken = resp.refresh_token;
			app.locals.lightningEndPointURI = process.env.LIGHTNING_END_POINT_URI;
			var refreshToken = resp.refresh_token;
			var id = resp.id;
			console.log('id val - '+id);
			var idList = id.split('/');
			console.log('idList - '+idList);
			var userId = idList[idList.length-1];
			var orgId = idList[idList.length-2];
			console.log('oAuth val - '+JSON.stringify(resp));
			oauth.updateUserAndOrgIds(orgId, userId, refreshToken);
			res.redirect('/home');
		} else {
			console.log('Error: ' + err.message);
		}
	});
};

oauth.updateUserAndOrgIds = function(orgId, userId, refreshToken) {
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '<>', orgId)
		.insert({organisation_id: orgId, user_id: userId, refresh_token: refreshToken}).into('ldlt_sfdc_oauth')
		.catch(function(error) {
		    console.log('ERROR --> '+error);
		  });
	console.log('About to update');
	knex('ldlt_sfdc_oauth')
		.update({user_id: userId, refresh_token: refreshToken})
		.where('organisation_id', '=', orgId)
		.then()
		.catch(function(error) {
		    console.log('updateUserAndOrgIds ERROR --> '+error);
		});
	console.log('Updated');
		

};

oauth.revokeAccess = function(req) {
	var caller = document.referrer;
	var count = process.env.LIGHTNING_END_POINT_URI.indexOf(".lightning.force.com");
	var strDomain = process.env.LIGHTNING_END_POINT_URI.substring(0,count);
	var flag = (caller.startsWith(strDomain)) && (req.query.clientId == process.env.OAUTH_KEY); 
	if(flag){
		knex('ldlt_sfdc_oauth')
		.where('organisation_id', '=', req.query.orgId)
		.del()
		.then()		
		.catch(function(error) {
		    console.log('updateUserAndOrgIds ERROR --> '+error);
		});
		console.log('Updated');
	}
};

oauth.redirectToHome = function(res, app){
	knex('ldlt_sfdc_oauth').where({
	  organisation_id: '00Dj0000000L7zM',
	  user_id:  '005j000000BKaRz'
	}).select('refresh_token').then(function(rows){
		console.log('rows[0].refresh_token --> '+rows[0].refresh_token);
		oauth.getATFromRT(res, app, rows[0].refresh_token);
	})
	.catch(function(error) {
		console.log('redirectToHome ERROR --> '+error);
	});
};

oauth.getATFromRT = function(res, app, refreshToken){
	var oauth = {
		refresh_token : refreshToken	
	};
	connection.getOrg().refreshToken({oauth: oauth}, function(err, resp){
		console.log('err - '+err);
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			app.locals.oauthtoken = resp.access_token;
			app.locals.refreshtoken = resp.refresh_token;
			app.locals.lightningEndPointURI = process.env.LIGHTNING_END_POINT_URI;
			console.log('resp with new access token - '+JSON.stringify(resp));
			res.redirect('/home');
		} else {
			console.log('Within refreshToken - '+err);
			console.log('Error: ' + err.message);
		}
	});
}

oauth.redirectAuthURI = function(res) {
	res.redirect(connection.getOrg().getAuthUri());
};

module.exports = oauth;