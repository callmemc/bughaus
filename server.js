import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import socket from 'socket.io';
import path from 'path';
import socketServer from './socketServer';
import * as db from './db';
import _ from 'lodash';

const app = express();
const port = process.env.PORT || 3001;
app.set('port', port);
app.use(bodyParser.json());

// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

const server = require('http').createServer(app);
server.listen(port, () => {
  console.log(`** Server listening on port ${port} **`);
});
const io = socket.listen(server);
socketServer.attach(io);

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
      // Username associated with session and game
      const { username } = req.session[gameId] || {};
      res.json(_.extend(
        result,
        {
          username: username || null
        }
      ));
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

  // Serve app when using client-side routing by serving index.html for any unknown paths
  // (See https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#serving-apps-with-client-side-routing)
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}).catch((error) => {
  console.error(error);
});
