var Player   = require('./Player'),
    async    = require('async'),
    Game     = require('./Game');

/**
 * socket io events handlers
 */

module.exports = {

    startGame : function (connection, data) {
        var games    = app.storage.games,
            player   = new Player(connection),
            game     = null;

        async.waterfall([
            function (next) {
                player.connection.get('gameId', next);
            },
            function (gameId, next) {
                player.connection.get('playerIndex', function (err, index) {
                    next(err, gameId, index);
                });
            },
            function (id, playerIndex, next) {
                if (id == undefined || playerIndex == undefined) {
                    return next();
                }
                var oldGame = app.storage.findGame(id);

                //if user has old uncompleted game - finish it
                if (oldGame) {
                    oldGame.finish({reason: 'opponentLeaving', team: oldGame.players[playerIndex].team}, next);
                } else {
                    next();
                }
            }
        ], function (err) {
            game = games.length ? games[games.length - 1] : null;

            if (!game || game.players.length === 2) {
                game = new Game();
            }

            game.addPlayer(player);
        });
    },

    turn : function (connection, data) {
        var gameId;

        //todo: send errors to client
        if (data.x == undefined || data.y == undefined) {
            return console.error('Not enough parameters');
        }

        async.waterfall([
            function (next) {
                connection.get('gameId', next)
            },
            function (id, next) {
                gameId = id;
                connection.get('playerIndex', next);
            }
        ], function (err, playerIndex) {
            var game   = gameId != undefined ? app.storage.findGame(gameId) : null,
                player = game ? game.players[playerIndex] : null;

            if (!game) {
                return console.error('game not found', gameId);
            }

            if (!player) {
                return console.error('player not found', gameId, playerIndex);
            }

            if (game.currentTeam !== player.team) {
                return;
            }

            game.turn(data.x, data.y);
        });
    },

    disconnect : function (connection, data) {
        var gameId;
        async.waterfall([
            function (next) {
                connection.get('gameId', next)
            },
            function (id, next) {
                gameId = id;
                connection.get('playerIndex', next);
            }
        ], function (err, playerIndex) {
            if (err) {
                console.error(err);
            }

            if (gameId == undefined) {
                return;
            }

            var game   = app.storage.findGame(gameId),
                player = playerIndex != undefined ? game.players[playerIndex] : null;

            game.finish({reason: 'opponentLeaving',  team: player ? player.team : null});
        });
    }
};
