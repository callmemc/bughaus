function connectSocket(socket) {
  // Each socket is associated with just one game id
  // TODO: Make sure this is ok
  let socketGameId;

  console.log('connect', socketGameId);

  socket.on('watch', gameId => {
    console.log('WATCH!', gameId);
    socketGameId = gameId;

    socket.join(gameId, () => {
      socket.emit('update', 'starting position');
    });
  });

  socket.on('move', (data) => {
    console.log('MOVE!', socketGameId, data);
    socket.to(socketGameId).emit('update', data + ' new position');
  });
}


export default {
  attach: function attach(io) {
    io.sockets.on('connection', connectSocket);
  }
};