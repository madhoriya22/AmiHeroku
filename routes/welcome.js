var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
	res.render('pages/welcome', {
		orgid: req.session.orgid,
		communityUrl:req.session.communityUrl
	});
});

module.exports = router;
