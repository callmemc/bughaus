import _ from 'lodash';
import * as db from './db';
import Timer from './timer';

let IO;

// TODO: This is necessary because different rooms need to access the same timer
//  Longer-term solution involves an adapter?
//  For now, enabled session affinity (https://devcenter.heroku.com/articles/node-websockets#option-2-socket-io-start-the-app)
//  Also see: https://devcenter.heroku.com/articles/websockets#application-architecture
const timers = {};

function connectSocket(socket) {
  // Each socket is associated with just one game id
  const socketGameId = socket.handshake.query.gameId;

  if (!socketGameId) {
    return;
  }

  socket.join(socketGameId);

  // If player is found, update player's game status to connected
  updateUserStatus('CONNECTED');

  socket.on('move', ({ game, boardNum, nextColor, isCapture }) => {
    // If checkmate, end timer
    // TODO: Restart timer
    const timer = timers[socketGameId];
    if (timer) {
      if (game.winner) {
        timer.endTimer();
      } else {
        timer.updateTurn(boardNum, nextColor);
      }
    } else {
      console.error('Timer not found');
    }

    // Update other sockets in the room
    socket.to(socketGameId).emit('updateGameFromMove', {
      game,
      isCapture
    });
    db.updateGame(socketGameId, game);
  });

  socket.on('setUsername', (data) => {
    const { gameId, username } = data;

    // Save username for a given game in session
    socket.request.session[gameId] = { username };
    socket.request.session.save();
  });

  socket.on('selectPlayer', (data) => {
    const { gameId, userKey, username } = data;

    // If all users have joined, start game, and signify that to user
    db.getGame(gameId).then((result) => {
      const { wPlayer0, wPlayer1, bPlayer0, bPlayer1 } = result || {};

      // TODO: This is ugly
      if (
        ((userKey === 'wPlayer0' && username) || wPlayer0) &&
        ((userKey === 'wPlayer1' && username) || wPlayer1) &&
        ((userKey === 'bPlayer0' && username) || bPlayer0) &&
        ((userKey === 'bPlayer1' && username) || bPlayer1)) {

        // Send flip board data
        IO.to(socketGameId).emit('startGame',
          _.extend({
            wPlayer0: _.get(wPlayer0, 'username'),
            wPlayer1: _.get(wPlayer1, 'username'),
            bPlayer0: _.get(bPlayer0, 'username'),
            bPlayer1: _.get(bPlayer1, 'username')
          }, {
            [userKey]: username
          })
        );

        // Start game timer
        const timer = new Timer();
        timers[socketGameId] = timer;
        timer.startTimer(emitTime, endGame);
      }
    });

    // Update the game to reflect the username
    // const username = socket.request.session[gameId].username;
    const gameData = {
      [userKey]: { username, status: 'CONNECTED' }
    };
    IO.to(socketGameId).emit('updateGame', gameData);
    db.updateGame(gameId, gameData);
  });

  socket.on('deselectPlayer', (data) => {
    const { gameId, userKey } = data;

    const gameData = { [userKey]: null };

    IO.to(socketGameId).emit('updateGame', gameData);
    db.updateGame(gameId, gameData);
  });

  // Update player's game status to disconnected
  socket.on('disconnect', () => {
    console.debug('disconnect', socketGameId);
    if (!socketGameId) {
      return;
    }

    updateUserStatus('DISCONNECTED');
  });

  function updateUserStatus(status) {
    const { username } = socket.request.session[socketGameId] || {};
    if (!username) {
      return;
    }

    db.getGame(socketGameId).then((result) => {
      // TODO: Move this into constants module
      const userKeys = ['wPlayer0', 'wPlayer1', 'bPlayer0', 'bPlayer1'];
      const gameData = _.reduce(userKeys, (memo, key) => {
        if (_.get(result[key], 'username') === username) {
          memo[key] = { username, status };
        }
        return memo;
      }, {});

      if (!_.isEmpty(gameData)) {
        IO.to(socketGameId).emit('updateGame', gameData);
        db.updateGame(socketGameId, gameData);
      }
    });
  }

  function emitTime({ counters0, counters1 }) {
    // Write timers to db in case server crashes
    db.updateGame(socketGameId, { counters0, counters1 });
    IO.to(socketGameId).emit('timer', { counters0, counters1 });
  }

  function endGame({ boardNum, color }) {
    const gameData = { winner: { boardNum, color } };
    db.updateGame(socketGameId, gameData);
    IO.to(socketGameId).emit('updateGame', gameData);
  }
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
    IO = io;
  }
};