import * as db from './db';

let IO;

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

  socket.on('createUsername', (data) => {
    const { gameId, username } = data;

    // Save user's game session info
    socket.request.session[gameId] = { username };
    socket.request.session.save();
  });

  socket.on('join', (data) => {
    const { gameId, userKey, username } = data;

    // If all users have joined, start game, and signify that to user
    db.getGame(gameId).then((result) => {
      const { wUserId0, wUserId1, bUserId0, bUserId1 } = result || {};
      if (
        ((userKey === 'wUserId0' && username) || wUserId0) &&
        ((userKey === 'wUserId1' && username) || wUserId1) &&
        ((userKey === 'bUserId0' && username) || bUserId0) &&
        ((userKey === 'bUserId1' && username) || bUserId1)) {

        console.log('TODO: Start clock');

        // Send flip board data
        IO.to(socketGameId).emit('startGame',
          { wUserId0, wUserId1, bUserId0, bUserId1 });
      }
    });

    // Update the game to reflect the username
    // const username = socket.request.session[gameId].username;
    const gameData = { [userKey]: username };
    socket.to(socketGameId).emit('updateGame', gameData);
    db.updateGame(gameId, { ...data, ...gameData });
  });
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
    IO = io;
  }
};