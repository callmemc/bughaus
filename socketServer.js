import _ from 'lodash';
import * as db from './db';
import Timer from './timer';

let IO;

// TODO: This is necessary because different rooms need to access the same timer
//  Longer-term solution involves an adapter?
//  For now, enabled session affinity (https://devcenter.heroku.com/articles/node-websockets#option-2-socket-io-start-the-app)
//  Also see: https://devcenter.heroku.com/articles/websockets#application-architecture
const timers = {};
const connections = {};

function connectSocket(socket) {
  // Each socket is associated with just one game id
  const socketGameId = socket.handshake.query.gameId;

  if (!socketGameId) {
    return;
  }

  socket.join(socketGameId);

  // If player is found, update player's game status to connected
  updateConnection(true);

  /**
   *  1. Store updated game in db
   *  2. Update other clients
   */
  socket.on('move', ({ data, boardNum, nextColor, isCapture }) => {
    // If checkmate, end timer. TODO: Restart timer
    const timer = timers[socketGameId];
    if (timer) {
      if (data.winner) {
        timer.endTimer();
      } else {
        timer.updateTurn(boardNum, nextColor);
      }
    } else {
      console.error('Timer not found');
    }

    socket.to(socketGameId).emit('pushMove', {
      data, boardNum, isCapture
    });

    db.addPosition(socketGameId, data.newPosition);
    db.addMove(socketGameId, boardNum, data.move);
    db.updateGame(socketGameId, { winner: data.winner });
  });

  /*
   * Join game as a player
   */
  socket.on('join', (data) => {
    // If all users have joined, start game
    db.getGame(socketGameId).then((result) => {
      const { boardNum, color, username, isConnected } = data;

      if (!connections[socketGameId]) {
        connections[socketGameId] = [{}, {}];
      }
      connections[socketGameId][boardNum][color] = isConnected;

      const allConnected = _.every(connections[socketGameId], board => board.w && board.b);
      if (allConnected && !timers[socketGameId]) {
        // Start game timer
        const timer = new Timer();
        timers[socketGameId] = timer;
        timer.startTimer(emitTime, endGame);
      }
    });

    IO.to(socketGameId).emit('pushJoin', data);
    db.updatePlayer(socketGameId, data);
  });

  /*
   * Store username associated with a game in the user's session
   */
  socket.on('setUsername', (data) => {
    const { username } = data;

    // Save username for a given game in session
    socket.request.session[socketGameId] = { username };
    socket.request.session.save();
  });

  /*
   * Update player's game status to disconnected
   */
  socket.on('disconnect', () => {
    console.debug('disconnect', socketGameId);
    if (!socketGameId) {
      return;
    }

    updateConnection(false);
  });

  /******************** HELPERS *********************/

  function updateConnection(isConnected) {
    const { username } = socket.request.session[socketGameId] || {};

    db.getGame(socketGameId).then((result) => {
      const initialConnections = connections[socketGameId] || [{}, {}];

      // Update connections for all user's players
      connections[socketGameId] = _.reduce(result.currentGames, (memo, game, boardNum) => {
        ['w', 'b'].forEach(color => {
          if (game[`${color}Player`] === username) {
            memo[boardNum][color] = isConnected;
          }
        });
        return memo;
      }, initialConnections);

      IO.to(socketGameId).emit('updateGame', {
        connections: connections[socketGameId]
      });
    });
  }


  function emitTime(timers) {
    // TODO: Write timers to db in case server crashes
      // Cache in memory, with db as fallback
    // db.updateGame(socketGameId, timers);
    IO.to(socketGameId).emit('updateGame', { timers });
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
  },
  connections       // TODO: Move to own module
};
