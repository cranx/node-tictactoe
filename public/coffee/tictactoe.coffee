$ ->
  socket   = io.connect appConfig.httpHost
  team     = 0
  turnTeam = 0
  CROSS    = 1
  NOUGHT   = 2
  $start   = $ '#start-game'
  $team    = $ '#team'
  $info    = $ '#info'
  $board   = $ '#board > table'
  $status  = $ '#status'

  $start.hide()

  updateText = ($block, message) ->
    $block.hide()
    $block.html message
    $block.fadeIn()

  redrawBoard = (board) ->
    html = ''
    for i in [0...board.length]
      html += '<tr>'
      for j in [0...board.length]
        styleClass = '';
        symbol = '';
        if board[i][j] is CROSS
          styleClass = 'cross'
          symbol     = 'X'
        else if board[i][j] is NOUGHT
          styleClass = 'nought'
          symbol     = 'O'

        html += """
          <td --data-x="#{i}" --data-y="#{j}" class="#{styleClass}">
            #{symbol}
          </td>
        """
      html += '</tr>'

    $board.html html

  $status.text 'Connecting to server...'

  socket.on 'connect', ->
    $start.show()
    updateText $status, 'Connection established'

    ($ '#board').on 'click', 'td', ->
      $this = $(@);
      return if team != turnTeam or ($this.attr 'class') != ''

      socket.emit 'turn', x: ($this.attr '--data-x'), y: ($this.attr '--data-y')

  socket.on 'waitingForOpponent', ->
    updateText $status, 'Waiting for opponent...'

  socket.on 'gameStarted', (data) ->
    team = data.team
    updateText $team, "You are playing for #{if team is CROSS then 'X' else 'O'}"
    updateText $status, 'Game started'

  socket.on 'gameStateChanged', (data) ->
    turnTeam = data.currentTeam
    redrawBoard data.board
    updateText $info, "Now is #{if team == turnTeam then 'your turn' else 'your opponent\'s turn'}"

  socket.on 'gameFinished', (data) ->
    turnTeam = 0;

    if data.reason is 'opponentLeaving' and data.team != team
      $info.text ''
      $team.text ''
      updateText $status, '<span class="bad">Sorry, but your opponent left the game. Try to start new game</span>'
    else if data.reason is 'complete'
      if data.winner == team
        message = '<span class="good">You win! ^^</span>'
      else if (data.winner == -1)
        message = 'Draw! -_-'
      else
        message = '<span class="bad">You lose! ;_;</span>'

      redrawBoard data.board
      updateText $info, message

  $start.click ->
      $info.text ''
      $team.text ''
      socket.emit 'startGame'
      updateText $status, 'Trying to create new game...'
      off