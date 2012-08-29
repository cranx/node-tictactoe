/**
 * Application Initializing.
 */
(function init() {
    global.app = {
        server  : {},
        config  : require('./config.default'),
        storage : require('./lib/Storage')
    };

    var fs            = require('fs'),
        express       = require('express'),
        http          = require('http'),
        utils         = require('./utils'),
        expressServer = global.app.server = express(),
        server        = http.createServer(expressServer),
        io            = require('socket.io').listen(server, {'log level': 1}),
        listeners     = require('./lib/Listeners'),
        clientSetting = ['httpHost'],
        clientConfig;

    try {
        appConfig = require('./config');
        global.app.config.extend(appConfig);
    } catch (e) {}

    //generating config file for client-side
    clientConfig = (function () {
        var config = {};

        if (typeof clientSetting === 'array' && clientSetting.length) {
            Object.keys(app.config).forEach(function (setting) {
                if (clientSetting.indexOf(setting)) {
                    config[setting] = app.config[setting];
                }
            });
        }

        return config;
    }());

    clientConfig = 'var appConfig = ' + JSON.stringify(global.app.config) + ';';

    fs.writeFile('./public/js/config.js', clientConfig, function (err) {
        if (err) {
            console.error(err);
        }
    });

    server.listen(app.config.httpPort, app.config.httpHost);

    //static
    expressServer.use('/', express.static('./public'));

    //listeners
    io.sockets.on('connection', function (socket) {
        Object.keys(listeners).forEach(function (action) {
            socket.on(action, function (data) {
                listeners[action](socket, data);
            });
        });
    });
})();
