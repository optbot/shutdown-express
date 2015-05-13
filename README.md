# shutdown-express

Middleware for Express that gracefully shuts down an instance.

Usage
---
### Basic
You do not run or install this package like other optbot services. This is a library for use within those services to read configuration in a uniform fashion. You should only declare this as a dependency within your `package.json`.

	"dependencies": {
        "@optbot/shutdown-express": "git://github.com/optbot/shutdown-express.git",
	}

### Details
       
Example from within an optbot service (hypothetically named `ui`):

    var app = express();
    var shutdown = require('@optbot/shutdown-express')();

    app.use(shutdown.middleware);

    var server = app.listen(8080);

    shutdown.extend(server);

    server.closeGracefully(
        null,
        function gracefulShutdown() { /*Closing gracefully.*/ }
        function forcefulShutdown() { /*Closing forcefully.*/ }
    );

Testing
---
### Code conformity
    $ jshint lib
    $ jscs .

Connects to
---
No connections
