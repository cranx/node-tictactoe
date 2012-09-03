global.app =
  server  : {}
  config  : require './config.default'
  storage : require './lib/Storage'
exec          = (require 'child_process').exec
fs            = require 'fs'
express       = require 'express'
http          = require 'http'
utils         = require './overrides'
expressServer = global.app.server = express()
server        = http.createServer expressServer
io            = (require 'socket.io').listen server, 'log level': 1
listeners     = require './lib/Listeners'
clientSetting = ['httpHost']

try
  appConfig = require('./config');
  global.app.config.extend(appConfig);
catch error

#generating config file for client-side
clientConfig = do ->
  return {} if !clientSetting? or typeof clientSetting isnt 'array'
  result = []
  for setting of app.config when (clientSetting.indexOf setting) isnt -1
    result[setting] = app.config[setting]
  result

clientConfig = "var appConfig = #{JSON.stringify global.app.config};"

fs.writeFile './public/js/config.js', clientConfig, (err) ->
  console.error(err) if err

#compiling clients files
exec 'coffee --compile --output ./public/js/ ./public/coffee/', (err, stdout, stderr) ->
  console.error err if err
  console.error stderr if stderr

server.listen process.env.PORT || app.config.httpPort

#static
expressServer.use '/', express.static './public'

#listeners
io.sockets.on 'connection', (socket) ->
  for actionName, action of listeners
    do (actionName) -> socket.on actionName, (data) ->
      listeners[actionName] socket, data
  undefined
