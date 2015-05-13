module.exports = function shutdown(opts) {
  'use strict';

  var extend = require('extend');

  opts = opts || {};

  var shuttingDown = false;

  var options = {
    timeout: 10 * 1000, // 10 seconds
  };

  extend(true, options, opts);

  var closeGracefully = function(signal, gracefulShutdown, forcefulShutdown) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    this.close(function() {
      if (gracefulShutdown) {
        gracefulShutdown();
      }
    });

    setTimeout(function() {
      if (forcefulShutdown) {
        forcefulShutdown();
      }
    }, options.timeout);
  };

  return {
    extend: function(server) {
      if (!server) {
        throw new Exception('No server provided');
      } else if (server.closeGracefully) {
        throw new Exception('closeGracefully already defined');
      }
      server.closeGracefully = closeGracefully.bind(server);
    },
    middleware: function(req, res, next) {
      res.set('Connection', 'close');

      if (!shuttingDown) {
        return next();
      }

      res.send(503, 'Going down');
    }
  }
};
