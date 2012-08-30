async = require('async');
/**
 * Game player wrapper
 */
var Player = module.exports = function (connection) {
        this.connection = connection;
        this.team       = 0;
    };

Player.prototype.extend({
    send: function (eventName, data) {
        this.connection.emit(eventName, data);
    },

    /**
     * Setting data to player connection for it's identification
     *
     * @param {Object} data
     * @param {Function} callback
     */
    setData: function (data, callback) {
        async.forEach(Object.keys(data), function (key, cb) {
            this.connection.set(key, data[key], cb)
        }.bind(this), callback)
    },

    /**
     * Returns connection data for gotten keys
     *
     * @param {Array} keys
     * @param {Function} callback
     */
    getData: function (keys, callback) {
        var parallels = {};
        keys.forEach(function (key) {
            parallels[key] = this.connection.get.bind(this.connection, key);
        }.bind(this));

        async.parallel(parallels, callback);
    }
});
