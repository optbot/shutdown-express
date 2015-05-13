module.exports = function(server, opts) {
  'use strict';

  var extend = require('extend');

  opts = opts || {};

  var shuttingDown = false;

  var options = {
    logger: console,
    timeout: 10 * 1000, // 10 seconds
    gracefulShutdown: null,
    forcefulShutdown: null
  };

  extend(true, options, opts);

  server.closeGracefully = function(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    options.logger.warn('Received kill signal (%s)',
      signal || 'UNKNOWN');

    setTimeout(function() {
      options.logger.error(
        'Failed to close connections, recommending forceful close.');

      if (options.forcefulShutdown) {
        options.forcefulShutdown();
      }
    }, options.timeout);

    server.close(function() {
      options.logger.info('Gracefully closed connections.');
      if (options.gracefulShutdown) {
        options.gracefulShutdown();
      }
    });
  };

  return function middleware(req, res, next) {
    if (!shuttingDown) {
      return next();
    }

    res.set('Connection', 'close');
    res.send(503, 'Going down');
  };
}(server, opts);
