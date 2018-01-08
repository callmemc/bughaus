function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    socketGameId = gameId;

    socket.join(gameId, () => {
      // TODO: Remove this in favor of api call
      socket.emit('updateGame', getGame(gameId));
    });
  });

  socket.on('move', (data) => {
    socket.to(socketGameId).emit('updateGame', data);
    updateGame(socketGameId, data);
  });
}

// TODO: Replace this with actual DB that isn't just in memory
let MOCKDB = {};

function getGame(gameId) {
  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const INITIAL_GAME = {
    fen0: INITIAL_FEN,
    wReserve0: '',
    bReserve0: '',
    fen1: INITIAL_FEN,
    wReserve1: '',
    bReserve1: '',
  };

  // TODO: Initialize game on an api create call instead
  if (!MOCKDB[gameId]) {
    MOCKDB[gameId] = INITIAL_GAME;
  }

  return MOCKDB[gameId];
}

function updateGame(gameId, data) {
  MOCKDB[gameId] = {...MOCKDB[gameId], ...data};
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
  }
};