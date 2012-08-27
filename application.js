/**
 * Application Initializing.
 */
(function init() {
    global.app = {
        server: {},
        config: {}
    };

    var express = require('express'),
        expressServer = global.app.server = express(),
        http = require('http'),
        server = http.createServer(expressServer),
        io = require('socket.io').listen(server, {'log level': 1}),
        utils = require('./utils'),
        defaultConfig = require('./config.default');

    try {
        appConfig = require('./config');
        global.app.config = defaultConfig.extend(appConfig);
    } catch (e) {
        global.app.config = defaultConfig;
    }

    server.listen(app.config.httpPort);

    //static
    expressServer.use('/', express.static('./public'));

    io.sockets.on('connection', function (socket) {
        console.log('socket connected');
        socket.emit('test', { hello: 'world' });
        socket.on('fromclient', function (data) {
            console.log(data);
        });
    });
})();
