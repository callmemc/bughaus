function connectSocket(socket) {
  // Each socket is associated with just one game id?
  let socketGameId;

  socket.on('watch', gameId => {
    console.log('WATCH!', gameId);
    socketGameId = gameId;
  });

  socket.on('move', (data) => {
    console.log('MOVE!', socketGameId, data);
    socket.to(socketGameId).emit('update', data);
  });  
}


export default { 
  attach: function attach(io) {
    io.sockets.on('connection', connectSocket);
  }
};