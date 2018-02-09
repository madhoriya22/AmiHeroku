var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	console.log('access token from redis '+req.session.accesstoken);
	console.log('url from redis '+req.session.sfdcurl);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization,X-Authorization'); 
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
	res.render('pages/home', {
		str: req.session.accesstoken,
		sfdcurl: req.session.sfdcurl,
		orgid: req.session.orgid,
		namespace: process.env['SF_NAMESPACE'],
		idletime: process.env['SESSION_IDLE_TIME'],
		communityURL:req.session.communityUrl
	});
});

module.exports = router;
