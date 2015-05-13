module.exports = function(server, opts) {
  'use strict';

  var extend = require('extend');

  opts = opts || {};

  var shuttingDown = false;

  var options = {
    logger: console,
    timeout: 10 * 1000, // 10 seconds
    gracefulShutdown: null,
    forceShutdown: null
  };

  extend(true, options, opts);

  function gracefulShutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    options.logger.warn('Received kill signal (%s), shutting down', signal);

    setTimeout(function () {
      options.logger.error(
        'Could not close connections in time, recommending forceful ' +
        'shut down.');

      options.forceShutdown();
    }, options.timeout);

    server.close(function () {
      options.logger.info('Gracefully closed remaining connections.');
      if (options.gracefulShutdown) {
        options.gracefulShutdown();
      }
    });
  };

  process.on('SIGTERM', gracefulShutdown.call(null, 'SIGTERM'));
  process.on('SIGINT', gracefulShutdown.call(null, 'SIGINT'));

  return function middleware(req, res, next) {
    if (!shuttingDown) {
      return next();
    }

    res.set('Connection', 'close');
    res.send(503, 'Going down');
  };
}(server, opts);
