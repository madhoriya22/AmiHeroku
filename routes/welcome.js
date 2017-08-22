var express = require('express');
var router = express.Router();
console.log('Before going into the welcome page');
router.get('/welcome', function(req, res) {
	res.render('pages/welcome');
});

module.exports = router;
