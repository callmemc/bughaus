import * as db from './db';

function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    socketGameId = gameId;

    socket.join(gameId);
  });

  socket.on('move', (data) => {
    socket.to(socketGameId).emit('updateGame', data);
    db.updateGame(socketGameId, data);
  });

  socket.on('join', (data) => {
    const { gameId, username, boardNum, color, userKey } = data;

    // Update the game to reflect the username
    const gameData = { [userKey]: username };
    socket.to(socketGameId).emit('updateGame', gameData);
    db.updateGame(gameId, { ...data, ...gameData });

    // Save user's game session info
    socket.request.session[gameId] = { username, boardNum, color };
    socket.request.session.save();
  });
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
  }
};