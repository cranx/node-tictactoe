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
    }
});
