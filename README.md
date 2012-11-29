Original game http://en.wikipedia.org/wiki/Tic-tac-toe

`node-tictactoe` is simple multiplayer game written in CoffeeScript on node.js using express, async and socket.io

There is no cookie-authorization, so you can start several games in several tabs of your browser.
If you close tab with game or close browser window or lost socket.io connection for any other reason you will never continue lost game.

You can [try it](http://node-tictactoe.herokuapp.com/) on [heroku cloud application platform](http://www.heroku.com/)

To install game:

1. Download project
2. From the project's root directory run `npm install`
3. Run `coffee application.coffee`
4. Open http://localhost page in you browser

Configure:

There is default config file `config.default.coffee`
You can override any setting by creating your own `config.coffee` with the same structure as default config
