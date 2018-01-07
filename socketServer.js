function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    console.log('WATCH!', gameId);
    socketGameId = gameId;

    socket.join(gameId, () => {
      // TODO: Remove this in favor of api call
      socket.emit('updateGame', getGame(gameId));
    });
  });

  socket.on('move', ({board, boardNum}) => {
    socket.to(socketGameId).emit('updateBoard', {board, boardNum});
    updateBoard(socketGameId, boardNum, board);
  });
}

// TODO: Replace this with actual DB that isn't just in memory
let MOCKDB = {};
function getGame(gameId) {
  const INITIAL_BOARD = {
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    wReserve: '', bReserve: ''
  };
  const INITIAL_GAME = [INITIAL_BOARD, INITIAL_BOARD];

  // TODO: Initialize game on an api create call instead
  if (!MOCKDB[gameId]) {
    MOCKDB[gameId] = INITIAL_GAME;
  }

  return MOCKDB[gameId];
}

function updateBoard(gameId, boardNum, board) {
  MOCKDB[gameId][boardNum] = board;
}

export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
    console.log('test');
  }
};