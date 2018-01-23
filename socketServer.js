function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    socketGameId = gameId;

    socket.join(gameId, () => {
      // TODO: Remove this in favor of api call
      const sessionData = socket.request.session[gameId];
      let flipBoard0 = false;
      if (sessionData) {
        const { color, boardNum } = sessionData;
        flipBoard0 = (color === 'b' && boardNum === 0) ||
          (color === 'w' && boardNum === 1);
      }

      socket.emit('updateGame', {
        ...getGame(gameId),
        currentSession: sessionData,
        isFlipped0: flipBoard0,
        isFlipped1: !flipBoard0
      });
    });
  });

  socket.on('move', (data) => {
    socket.to(socketGameId).emit('updateGame', data);
    saveGame(socketGameId, data);
  });

  socket.on('join', (data) => {
    const { gameId, username, boardNum, color, userKey } = data;

    // Update the game to reflect the username
    const gameData = { [userKey]: username };
    socket.to(socketGameId).emit('updateGame', gameData);
    saveGame(socketGameId, gameData);

    // Save user's game session info
    socket.request.session[gameId] = { username, boardNum, color };
    socket.request.session.save();
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
    bReserve1: ''
  };

  // TODO: Initialize game on an api create call instead
  if (!MOCKDB[gameId]) {
    MOCKDB[gameId] = INITIAL_GAME;
  }

  return MOCKDB[gameId];
}

function saveGame(gameId, data) {
  MOCKDB[gameId] = {...MOCKDB[gameId], ...data};
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
  }
};