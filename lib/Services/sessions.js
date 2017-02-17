var expressSession = require('express-session')
, util = require('util')
, RedisStore = require('connect-redis')(expressSession)
, Sessions = {}

Sessions.createSession = function() {
  var url = process.env['REDISCLOUD_URL'];
  console.log('URL'+url);
  var rtg = require('url').parse(url)

  , store = new RedisStore({
      ttl: 7200
    , host: rtg.hostname
    , port: rtg.port
    , pass: rtg.auth.split(':')[1]
    })
  , session = expressSession({
     secret: process.env['PRIVATE_KEY']
     ,store: store
    , resave: true
    , saveUninitialized: true
    });

  console.log('SESSION PORT'+rtg.port);

  return session;
};


module.exports = Sessions;