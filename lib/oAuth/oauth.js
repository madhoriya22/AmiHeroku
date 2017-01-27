"use strict";

var connection = require('./connection'),
	knex = require('../Services/db').knex;
var oauth = {};
var redis = require('redis');
var redisClient = redis.createClient();
redisClient.on('connect', function() {
    console.log('connected');
});

oauth.authenticate = function(req, res, app) {
	console.log('before oauth - '+req.query.code);
	connection.getOrg().authenticate({code: req.query.code}, function(err, resp){
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			var refreshToken = resp.refresh_token;
			var id = resp.id;
			console.log('app.locals.lightningEndPointURI - '+app.locals.lightningEndPointURI);
			var idList = id.split('/');
			console.log('idList - '+idList);
			var userId = idList[idList.length-1];
			var orgId = idList[idList.length-2];
			let redisKey = orgId + userId;
			redisClient.set(redisKey, resp.access_token);
			console.log('oAuth val - '+JSON.stringify(resp));
			oauth.updateUserAndOrgIds(orgId, userId, refreshToken, app.locals.lightningEndPointURI);
			res.redirect('/home?action=oauth');
		} else {
			console.log('Error: ' + err.message);
		}
	});
};

oauth.updateUserAndOrgIds = function(orgId, userId, refreshToken, orgUrl) {
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '<>', orgId)
		.insert({organisation_id: orgId, user_id: userId, refresh_token: refreshToken, organisation_url: orgUrl}).into('ldlt_sfdc_oauth')
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

oauth.redirectToHome = function(req, res, app){
	knex('ldlt_sfdc_oauth').where({
	  organisation_id: req.query.orgid,
	  user_id:  req.query.userid
	}).select('refresh_token').then(function(rows){
		console.log('rows[0].refresh_token --> '+rows[0].refresh_token);
		oauth.getATFromRT(req, res, app, rows[0].refresh_token);
	})
	.catch(function(error) {
		console.log('redirectToHome ERROR --> '+error);
	});
};

oauth.revokeAccess = function(req, res) {
	knex('ldlt_sfdc_oauth').where({
		  organisation_id: req.query.orgid
		}).select('refresh_token').then(function(rows){
			var rowCount = rows.length;
			for(var i=0;i<rowCount;i++){
				console.log('rows[0].refresh_token --> '+rows[i].refresh_token);
				connection.getOrg().revokeToken({token:rows[i].refresh_token},function(){});
			} 
		})
		.catch(function(error) {
			console.log('redirectToHome ERROR --> '+error);
		});
	
	
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '=', req.query.orgId)
		.del()
		.then()		
		.catch(function(error) {
		    console.log('Delete OAuth ERROR --> '+error);
		});
	console.log('Deleted OAuth');

	res.send({ success: null });
};

oauth.getATFromRT = function(req, res, app, refreshToken){
	var oauth = {
		refresh_token : refreshToken	
	};
	connection.getOrg().refreshToken({oauth: oauth}, function(err, resp){
		console.log('err - '+err);
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			app.locals.lightningEndPointURI = process.env.LIGHTNING_END_POINT_URI;
			console.log('resp with new access token - '+JSON.stringify(resp));
			let redisKey = req.orgid + req.userid;
			redisClient.set(redisKey, resp.access_token);
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
module.exports = redisClient;