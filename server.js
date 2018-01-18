import express from 'express';
import socket from 'socket.io';
const app = express();
const server = require('http').createServer(app);
const io = socket.listen(server);

import socketServer from './socketServer';
socketServer.attach(io);


app.set('port', (process.env.PORT || 3001));

// TODO: Move into another file
app.post('/api/game', function (req, res) {
  // TODO
	console.log('TODO: create game');
  res.send();
});

const port = app.get('port');
server.listen(port, () => {
 	console.log('Example app listening on port ' + port);
});