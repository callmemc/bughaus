function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  socket.on('watch', gameId => {
    console.log('WATCH!', gameId);
    socketGameId = gameId;

    socket.join(gameId, () => {
      // socket.emit('update', [initial fen]);
    });
  });

  socket.on('move', (data) => {
    console.log('MOVE!', socketGameId, data);
    socket.to(socketGameId).emit('update', data);
  });
}


export default {
  attach: function attach(io) {
    io.on('connection', connectSocket);
    console.log('test');
  }
};