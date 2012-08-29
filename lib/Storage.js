/**
 * Application memory storage... can be replaced with db library
 *
 */

var Storage = module.exports = {
    games: [],

    findGame: function (id) {
        var result = null;
        this.games.some(function (game) {
            if (game._id === id) {
                result = game;
                return true;
            }
        });

        return result;
    },

    removeGame: function (game) {
        var index = this.games.indexOf(game);

        if (index !== -1) {
            this.games.splice(index, 1);
        }
    }
};