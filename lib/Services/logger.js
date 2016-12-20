/**
 * http://usejsdoc.org/
 */
"use strict";
var bunyan = require('bunyan'), 
//dotenv = require('dotenv').load(), 
logger = bunyan.createLogger({
	name: 'api.dev.servicesource', 
	src: true, 
	serializers: {
		req: bunyan.stdSerializers.req, 
		res: bunyan.stdSerializers.res
    }, 
    level: (process.env.IS_LOGGING_ON === true ?  0 : bunyan.FATAL + 1)
});

module.exports = logger;