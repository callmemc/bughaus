import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import socket from 'socket.io';
import socketServer from './socketServer';
import * as db from './db';

const app = express();
app.use(bodyParser.json());

const server = require('http').createServer(app);
const io = socket.listen(server);

app.set('port', (process.env.PORT || 3001));

socketServer.attach(io);

const port = app.get('port');
server.listen(port, () => {
  console.log(`** Server listening on port ${port} **`);
});

/****** Session Middleware ******/

// TODO: Figure out why all app.use needs to be in a callback
// See https://github.com/jdesboeufs/connect-mongo/issues/261
db.connectClient().then((dbInstance) => {
  const MongoStore = require('connect-mongo')(session);
  const sessionMiddleware = session({
    secret: 'rJ1J9RVFe',
    saveUninitialized: true,
    resave: true,
    cookie: { path: '/', httpOnly: false, secure: false,  maxAge: 864000000 },
    store: new MongoStore({
      db: dbInstance,
      collection: 'sessions',
      ttl: 24 * 60 * 60
    })
  });

  // Note: this is not invoked until the server is hit!
  // So sessions aren't stored using express-session until server is hit
  app.use(sessionMiddleware);

  io.use(function(socket, next) {
      sessionMiddleware(socket.request, socket.request.res, next);
  });

  /****** API ******/

  app.get('/api/game/:id', function (req, res) {
    const gameId = req.params.id;

    db.getGame(gameId).then((result) => {
      const sessionData = req.session[gameId];
      let flipBoard0 = false;

      // TODO: move to util
      if (sessionData) {
        const { color, boardNum } = sessionData;
        flipBoard0 = (color === 'b' && boardNum === 0) ||
          (color === 'w' && boardNum === 1);
      }

      res.json({
        ...result,
        currentSession: sessionData,
        isFlipped0: flipBoard0,
        isFlipped1: !flipBoard0
      });
    });
  });

  app.post('/api/game', function (req, res) {
    if (!req.body.gameId) {
      // TODO: Send error message
      console.error('No game id');
      return;
    }
    db.createGame(req.body.gameId).then(() => {
      res.send();
    });
  });
});
