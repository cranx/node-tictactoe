/**
 * Game mechanics.
 *
 * @param {Player} gameStarter
 */
var async = require('async'),
    Game  = module.exports = function () {
        this.id         = Game.prototype.incrementedId++;
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
        var connectionData;

        player.team = this.players.length === 0 ? Game.CROSS : Game.NOUGHT;
        this.players.push(player);
        connectionData = {
            gameId      : this.id,
            playerIndex : this.players.indexOf(player)
        };

        player.setData(connectionData, function (err) {
            if (err) {
                console.error(err);
            }

            if (this.players.length === 2) {
                this.players.forEach(function (player) {
                    player.send('gameStarted', {team: player.team});
                });

                this.stateChanged();
            } else {
                player.send('waitingForOpponent');
            }
        }.bind(this));
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

        if (this.checkCompletion()) {
            this.finish({reason: 'complete', winner: this.currentTeam, board: this.board});
        } else {
            if (this.turnsCount === this.board.length * this.board.length) {
                this.finish({reason: 'complete', winner: -1, board: this.board});
                return;
            }
            this.currentTeam = this.currentTeam === Game.CROSS ? Game.NOUGHT : Game.CROSS;
            this.stateChanged();
        }
    },

    finish : function (data, callback) {
        callback = callback || function (err) { if (err) { console.error(err); } };
        var cleanConnectionData = {
                gameId      : null,
                playerIndex : null
            };

        async.forEach(this.players, function (player, cb) {
            player.setData(cleanConnectionData, cb);
        }, function (err) {
            if (err) {
                console.error(err);
            }

            this.players.forEach(function (player) {
                player.send('gameFinished', data);
            });

            app.storage.removeGame(this);

            callback();
        }.bind(this));
    }
});

//Some static constants
Game.CROSS = 1;
Game.NOUGHT = 2;