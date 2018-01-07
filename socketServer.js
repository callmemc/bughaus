function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    console.log('WATCH!', gameId);
    socketGameId = gameId;

    socket.join(gameId, () => {
      // TODO: Remove this when get position from api on initial game load?
      socket.emit('update', getFen(gameId));
    });
  });

  socket.on('move', (data) => {
    console.log('MOVE!', socketGameId, data);
    socket.to(socketGameId).emit('update', data);
    updateFen(socketGameId, data);
  });
}

// TODO: Replace this with actual DB that isn't just in memory
let MOCKDB = {};
function getFen(gameId) {
  const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  return MOCKDB[gameId] || { fen: INITIAL_FEN, wReserve: '', bReserve: '' };
}

function updateFen(gameId, data) {
  MOCKDB[gameId] = data;
}


export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
    console.log('test');
  }
};