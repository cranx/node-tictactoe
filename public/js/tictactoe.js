$(function () {
    var socket   = io.connect(appConfig.httpHost),
        team     = 0,
        turnTeam = 0,
        CROSS    = 1,
        NOUGHT   = 2,
        $start   = $('#start-game'),
        $team    = $('#team'),
        $info    = $('#info'),
        $board   = $('#board > table'),
        $status  = $('#status');

    $start.hide();

    updateText = function ($block, message) {
        $block.hide();
        $block.html(message);
        $block.fadeIn();
    };

    redrawBoard = function (board) {
        var html       = '',
            symbol     = '',
            styleClass = '';

        for (var i = 0; i < board.length; i++) {
            html += '<tr>';
            for (var j = 0; j < board.length; j++) {
                styleClass = '';
                symbol = '';
                if (board[i][j] === CROSS) {
                    styleClass = 'cross';
                    symbol     = 'X';
                } else if (board[i][j] === NOUGHT) {
                    styleClass = 'nought';
                    symbol     = 'O';
                }
                html += '<td --data-x="' + i + '" --data-y="' + j + '" class="'+ styleClass +'">';
                html += symbol;
                html += '</td>';
            }
            html += '</tr>';
        }

        $board.html(html);
    };

    $status.text('Connecting to server...');

    socket.on('connect', function () {
        $start.show();
        updateText($status, 'Connection established');

        $('#board').on('click', 'td', function () {
            var $this = $(this);

            if (team !== turnTeam || $this.text() !== '') {
                return;
            }

            socket.emit('turn', {x: $this.attr('--data-x'), y: $this.attr('--data-y')});
        });
    });

    socket.on('waitingForOpponent', function () {
        updateText($status, 'Waiting for opponent...');
    });

    socket.on('gameStarted', function (data) {
        team = data.team;
        updateText($team, 'You are playing for ' + (data.team === 1 ? 'X' : 'O'));
        updateText($status, 'Game started');
    });

    socket.on('gameStateChanged', function (data) {
        turnTeam = data.currentTeam;
        redrawBoard(data.board);
        updateText($info,'Now is ' +  (team === turnTeam ? 'your turn' : 'your opponent\'s turn'));
    });

    socket.on('gameFinished', function (data) {
        var message;

        turnTeam = 0;

        if (data.reason === 'opponentLeaving' && data.team !== team) {
            $info.text('');
            $team.text('');
            updateText($status, '<span class="bad">Sorry, but your opponent left the game. Try to start new game</span>');
        } else if (data.reason === 'complete') {
            if (data.winner === team) {
                message = '<span class="good">You win! ^^</span>';
            } else if (data.winner === -1) {
                message = 'Draw! -_-';
            } else {
                message = '<span class="bad">You lose! ;_;</span>';
            }

            redrawBoard(data.board);
            updateText($info, message);
        }

    });

    $start.click(function () {
        $info.text('');
        $team.text('');
        socket.emit('startGame');
        updateText($status, 'Trying to create new game...');
        return false;
    });
});