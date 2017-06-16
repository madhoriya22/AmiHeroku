"use strict";

var connection = require('./connection'),
	knex = require('../Services/db').knex;
var oauth = {};
var i=0;
oauth.authenticate = function(req, res, app) {
	console.log('before oauth - '+req.query.code);
	connection.getOrg().authenticate({code: req.query.code}, function(err, resp){
		if(!err) {
			console.log('Access Token: ' + resp.access_token);
			req.session.accesstoken = resp.access_token;
			var id = resp.id;
			var idList = id.split('/');
			console.log('idList - '+idList);
			var userId = idList[idList.length-1];
			var orgId = idList[idList.length-2];
			console.log('oAuth val - '+JSON.stringify(resp));
			oauth.updateUserAndOrgIds(orgId, userId, resp.refresh_token, req.session.sfdcurl,req.session.accesstoken);
			res.redirect('/home?action=oauth');
			
		} else {
			console.log('Error: ' + err.message);
		}
	});
};

oauth.updateUserAndOrgIds = function(orgId, userId, refreshToken, orgUrl,accessToken) {
	knex('ldlt_sfdc_oauth')
		.where('organisation_id', '<>', orgId)
		.insert({organisation_id: orgId, user_id: userId, refresh_token: refreshToken, organisation_url: orgUrl, access_token: accessToken}).into('ldlt_sfdc_oauth')
		.catch(function(error) {
		    console.log('ERROR --> '+error);
		 });
	console.log('About to update');
	knex('ldlt_sfdc_oauth')
		.update({user_id: userId, refresh_token: refreshToken, access_token: accessToken})
		.where('organisation_id', '=', orgId)
		.then()
		.catch(function(error) {
		    console.log('updateUserAndOrgIds ERROR --> '+error);
		});
	console.log('Updated');
	
};


function execute(){
	console.log("Inside execute");
	knex('ldlt_sfdc_oauth').select('refresh_token').then(function(rows){
		var rowCount = rows.length;
		
		for(var i=0;i<rowCount;i++){
			console.log('rows[0].refresh_token --> '+rows[i].refresh_token);
			var oauth = {
					refresh_token : rows[i].refresh_token
				};
			connection.getOrg().refreshToken({oauth: oauth}, function(err, resp){
				console.log('err - '+err);
				if(!err) {
					console.log('Access Token in from RT in execute : ' + resp.access_token);
					
				} else {
					console.log('Within execute err - '+err);
					console.log('Error: ' + err.message);
				}
			});
		}
		console.log("revoke access token execute");
		})
		.catch(function(error) {
			console.log('redirectToHome ERROR execute--> '+error);
		});
}

oauth.redirectToHome = function(req, res, app){
	console.log(req.query.orgid);
	req.session.orgid = req.query.orgid;
	knex('ldlt_sfdc_oauth').where({
		organisation_id: req.query.orgid
	}).select('access_token','refresh_token','organisation_url').then(function(rows){
		console.log('rows[0].access_token --> '+rows[0].access_token);
		//oauth.getATFromRT(req, res, rows[0]);
		
		req.session.accesstoken = rows[0].access_token;
		req.session.sfdcurl = rows[0].organisation_url;
		console.log('resp with new access token - '+req.session.accesstoken);
		res.redirect('/home?renId='+req.query.renId);
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
		.where('organisation_id', '=', req.query.orgid)
		.del()
		.then()		
		.catch(function(error) {
		    console.log('Delete OAuth ERROR --> '+error);
		});
	console.log('Deleted OAuth');

	res.send({ success: null });
};

oauth.getATFromRT = function(req, res, dbRow){
	var oauth = {
		refresh_token : dbRow.refresh_token	
	};
	connection.getOrg().refreshToken({oauth: oauth}, function(err, resp){
		console.log('err - '+err);
		if(!err) {
			console.log('Access Token in from RT: ' + resp.access_token);
			req.session.accesstoken = resp.access_token;
			req.session.sfdcurl = dbRow.organisation_url;
			console.log('resp with new access token from RT - '+JSON.stringify(resp));
			res.redirect('/home?renId='+req.query.renId);
		} else {
			console.log('Within refreshToken - '+err);
			console.log('Error: ' + err.message);
		}
	});
}

oauth.redirectAuthURI = function(res) {
	res.redirect(connection.getOrg().getAuthUri());
};

execute();
module.exports = oauth;