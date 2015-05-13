module.exports = function shutdown(opts) {
  'use strict';

  var extend = require('extend');

  var clients = [];

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

    clients.forEach(function(c) {
      c.destroy();
    });

    setTimeout(function() {
      if (forcefulShutdown) {
        forcefulShutdown();
      }
    }, options.timeout);
  };

  var trackClient = function(socket) {
    clients.push(socket);
    socket.on('close', function(s) {
      clients.splice(clients.indexOf(this), 1);
    });
  };

  return {
    extend: function(server) {
      if (!server) {
        throw new Exception('No server provided');
      } else if (server.closeGracefully) {
        throw new Exception('closeGracefully already defined');
      }
      server.on('connection', trackClient);
      server.closeGracefully = closeGracefully.bind(server);
    },
    middleware: function(req, res, next) {
      if (!shuttingDown) {
        return next();
      }

      res.set('Connection', 'close');
      res.send(503, 'Going down');
    }
  };
};
