var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	console.log('Rounter welcome');
	res.render('pages/welcome', {
		orgid: req.session.orgid,
		communityUrl:req.session.communityUrl
	});
});

module.exports = router;
