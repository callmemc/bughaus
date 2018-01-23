import express from 'express';
import session from 'express-session';
import socket from 'socket.io';
const app = express();
const server = require('http').createServer(app);
const io = socket.listen(server);

import socketServer from './socketServer';
socketServer.attach(io);


app.set('port', (process.env.PORT || 3001));

// TODO: Store session in Redis cache
const sessionMiddleware = session({
  secret: 'rJ1J9RVFe',
  saveUninitialized: true,
  resave: false,
  cookie: { path: '/', httpOnly: false, secure: false,  maxAge: 864000000 }
});

// Note: this is not invoked until the server is hit!
// So sessions aren't stored using express-session until server is hit
app.use(sessionMiddleware);

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.get('/session', function (req, res) {
  res.send();
});

// TODO
// app.post('/api/game', function (req, res) {
//   res.send();
// });

const port = app.get('port');
server.listen(port, () => {
 	console.log('Example app listening on port ' + port);
});