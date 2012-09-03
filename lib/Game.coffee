###
Game mechanics.
###
async = require 'async'

class Game
  constructor: ->
    @id          = Game::incrementedId++
    @board       = @createBoard()
    @currentTeam = Game.CROSS;
    @turnsCount  = 0;
    @players     = [];

    app.storage.games.push @


  incrementedId: 0


  ###
  Returns true if current player wins the game
  ###
  checkCompletion: ->
    return false if (Math.ceil @turnsCount / 2) < @board.length

    #todo: write more optimized and smart checking!
    checkDiagonals = =>
      diagonals = [
          [[0, 0], [1, 1], [2, 2]]
          [[0, 2], [1, 1], [2, 0]]
      ]

      diagonals.some (diagonal) =>
        diagonal.every (field) =>
          @board[field[0]][field[1]] == @currentTeam

    checkHorizontals = =>
      @board.some (horizontal) =>
        horizontal.every (field) =>
          field == @currentTeam

    checkVerticals = =>
      for y in [0...@board.length]
        winning = true
        for x in [0...@board.length]
          if @board[x][y] != @currentTeam
            winning = false
            break
        return winning if winning

    checkHorizontals() || checkVerticals() || checkDiagonals()


  addPlayer: (player) ->
    player.team = if @players.length is 0 then Game.CROSS else Game.NOUGHT
    @players.push player

    connectionData =
      gameId      : @id,
      playerIndex : @players.indexOf player

    player.setData connectionData, (err) =>
      console.error err if err

      if @players.length == 2
        for player in @players
          player.send 'gameStarted', {team: player.team}

        @stateChanged()
      else
        player.send 'waitingForOpponent'


  createBoard: ->
    @board = [
        [0, 0, 0]
        [0, 0, 0]
        [0, 0, 0]
    ]

  ###
  Notify players about changing state
  ###
  stateChanged: ->
    data =
      board       : @board,
      currentTeam : @currentTeam

    for player in @players
      player.send 'gameStateChanged', data


  turn: (x, y) ->
    @turnsCount++;
    @board[x][y] = @currentTeam;

    if @checkCompletion()
       @finish {reason: 'complete', winner: @currentTeam, board: @board}
    else
      draw = @turnsCount == @board.length * @board.length
      return @finish({reason: 'complete', winner: -1, board: @board}) if draw

      @currentTeam = if @currentTeam is Game.CROSS then Game.NOUGHT else Game.CROSS
      @stateChanged()


  finish: (data, callback) ->
    callback = callback || (err) -> console.error err if err
    cleanConnectionData =
      gameId      : null
      playerIndex : null

    async.forEach(
      @players
      (player, cb) ->
        player.setData cleanConnectionData, cb
      (err) =>
        console.error err if err

        for player in @players
          player.send 'gameFinished', data

        app.storage.removeGame @

        callback()
    )


#Some static constants
Game.CROSS  = 1
Game.NOUGHT = 2


module.exports = Game