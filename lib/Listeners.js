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
            player.getData.bind(player, ['gameId', 'playerIndex']),
            function (data, next) {
                if (data.gameId == undefined || data.playerIndex == undefined) {
                    return next();
                }
                var oldGame = app.storage.findGame(data.gameId);

                //if user has old uncompleted game - finish it
                if (oldGame) {
                    oldGame.finish({reason: 'opponentLeaving', team: oldGame.players[data.playerIndex].team}, next);
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

    turn : function (connection, turn) {
        var gameId;

        //todo: send errors to client
        if (turn.x == undefined || turn.y == undefined) {
            return console.error('Not enough parameters');
        }

        //not very nice...
        Player.prototype.getData.call({connection: connection}, ['gameId', 'playerIndex'], function (err, data) {
            var game   = data.gameId != undefined ? app.storage.findGame(data.gameId) : null,
                player = game ? game.players[data.playerIndex] : null;

            if (!game) {
                return console.error('game not found', data.gameId);
            }

            if (!player) {
                return console.error('player not found', data.gameId, data.playerIndex);
            }

            if (game.currentTeam !== player.team) {
                return;
            }

            if (game.board[turn.x][turn.y] !== 0) {
                return;
            }

            game.turn(turn.x, turn.y);
        });
    },

    disconnect : function (connection, data) {
        Player.prototype.getData.call({connection: connection}, ['gameId', 'playerIndex'], function (err, data) {
            if (err) {
                console.error(err);
            }

            if (data.gameId == undefined) {
                return;
            }

            var game   = app.storage.findGame(data.gameId),
                player = data.playerIndex != undefined ? game.players[data.playerIndex] : null;

            game.finish({reason: 'opponentLeaving',  team: player ? player.team : null});
        });
    }
};
