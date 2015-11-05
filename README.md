Original game http://en.wikipedia.org/wiki/Tic-tac-toe

`node-tictactoe` is a simple multiplayer game written in CoffeeScript on node.js using express, async and socket.io.

There is no authorization system so you can start several connections from different browser tabs. Also there is no way to reconnect to the game.

You can [try it here](http://node-tictactoe.herokuapp.com/).

To install project:

1. Download project
2. From the project's root directory run `npm install`
3. Run `coffee application.coffee`
4. Open localhost page in your browser

Configure:

There is default config file `config.default.coffee`.
You can override any setting by creating your own `config.coffee` with the same structure as default config.
