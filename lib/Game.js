/**
 * Game mechanics.
 *
 * @param {Player} gameStarter
 */
var async = require('async'),
    Game  = module.exports = function () {
        this._id         = Game.prototype.incrementedId++;
        this.board       = this.createBoard();
        this.currentTeam = Game.CROSS;
        this.turnsCount  = 0;
        this.players     = [];

        app.storage.games.push(this);
    };

Game.prototype.extend({

    incrementedId: 0,

    /**
     * Returns true if current player win the game
     */
    checkCompletion : function () {
        if (Math.ceil(this.turnsCount / 2) < this.board.length) {
            return false;
        }

        //todo: write more optimized and smart checking!
        var board          = this.board,
            team           = this.currentTeam,
            checkDiagonals = function () {
                var diagonals = [
                    [[0, 0], [1, 1], [2, 2]],
                    [[0, 2], [1, 1], [2, 0]]
                ];

                return diagonals.some(function (diagonal) {
                    return diagonal.every(function (field) {
                        return board[field[0]][field[1]] === team;
                    });
                });
            },
            checkHorizontals = function () {
                return board.some(function (horizontal) {
                    return horizontal.every(function (field) {
                        return field === team;
                    });
                });
            },
            checkVerticals = function () {
                var winning = true,
                    length  = board.length,
                    x, y;

                for (y = 0; y < length; y++) {
                    winning = true;
                    for (x = 0; x < length; x++) {
                        if (board[x][y] !== team) {
                            winning = false;
                            break;
                        }
                    }

                    if (winning) {
                        return winning;
                    }
                }
            };

        return checkHorizontals() || checkVerticals() || checkDiagonals();
    },

    addPlayer : function (player) {
        var currentGame = this;

        player.team = this.players.length === 0 ? Game.CROSS : Game.NOUGHT;
        this.players.push(player);

        async.waterfall([
            function (next) {
                player.connection.set('gameId', currentGame._id, next);
            },
            function (next) {
                player.connection.set('playerIndex', currentGame.players.indexOf(player), next);
            }
        ], function (err) {
            if (err) {
                console.error(err);
            }

            if (currentGame.players.length === 2) {
                currentGame.players.forEach(function (player) {
                    player.send('gameStarted', {team: player.team});
                });

                currentGame.stateChanged();
            } else {
                player.send('waitingForOpponent');
            }
        });
    },

    createBoard : function () {
        return this.board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
    },

    /**
     * Notify players about changing state
     */
    stateChanged : function () {
        var data = {
                board       : this.board,
                currentTeam : this.currentTeam
            };

        this.players.forEach(function (player) {
            player.send('gameStateChanged', data);
        });
    },

    turn : function (x, y) {
        this.turnsCount++;
        this.board[x][y] = this.currentTeam;

        if (this.turnsCount === this.board.length * this.board.length) {
            this.finish({reason: 'complete', winner: -1, board: this.board});
            return;
        }

        if (this.checkCompletion()) {
            this.finish({reason: 'complete', winner: this.currentTeam, board: this.board});
        } else {
            this.currentTeam = this.currentTeam === Game.CROSS ? Game.NOUGHT : Game.CROSS;
            this.stateChanged();
        }
    },

    finish : function (data, callback) {
        callback = callback || function (err) { if (err) { console.error(err); } };
        var currentGame = this;

        async.forEach(currentGame.players, function (player, cb) {
            async.waterfall([
                function (next) {
                    player.connection.set('gameId', null, next);
                },
                function (next) {
                    player.connection.set('playerIndex', null, next);
                }
            ], cb);
        }, function (err) {
            if (err) {
                console.error(err);
            }

            currentGame.players.forEach(function (player) {
                player.send('gameFinished', data);
            });

            app.storage.removeGame(currentGame);

            callback();
        });
    }
});

//Some static constants
Game.CROSS = 1;
Game.NOUGHT = 2;