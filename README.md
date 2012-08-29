Original game http://en.wikipedia.org/wiki/Tic-tac-toe

Hi! Its my first project on gitHub. Simple multiplayer game written on node.js using express, async and socket.io

There is no cookie-authorization, so you can start several games in several tabs of your browser.
If you close tab with game or browser window or lost socket.io connection for any other reason you will never continue lost game.

To run game:

1. Download project
2. From the project's root directory run `npm install`
3. Run `node application.js`
4. Open http://localhost page in you browser

Configure:

There is default config file `config.default.js`
You can override any setting by creating you own `config.js` with the same structure as default config
