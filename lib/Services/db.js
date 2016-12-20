/**
 * http://usejsdoc.org/
 */
//var dotenv    = require('dotenv').load(), 
"use strict";
var knexOptions = {
	client      : 'postgresql', 
	connection  : {
		host      : process.env.POSTGRES_DATABASE_HOST, 
		user      : process.env.POSTGRES_DATABASE_USER, 
		password  : process.env.POSTGRES_DATABASE_PASS, 
		database  : process.env.POSTGRES_DATABASE_NAME, 
		charset   : 'utf8', 
		ssl       : true
	}, 
	pool: {
		min: 2,
		max: 20
	}, 
	debug       : process.env.IS_LOGGING_ON === true ? true : false
}, 
knex        = require('knex')(knexOptions), 
Bookshelf   = require('bookshelf')(knex); 
//log = require('./logger');
//log.info({ Bookshelf: Bookshelf }, 'Connection to Database');

Bookshelf.plugin('registry');
Bookshelf.plugin('visibility');
Bookshelf.plugin('virtuals');

module.exports = Bookshelf;