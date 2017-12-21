import io from 'socket.io-client';

function attachListeners(socket, gameId) {
  socket.on('connect', (data) => {
    console.log('connection', gameId);

    // watch game
    socket.emit('watch', gameId);
  });

  socket.on('update', (data) => {
    console.log('update', data);
  });
}

export default {
  initialize: function(gameId) {
    // Prevent the initial HTTP polling.  solution
    // See https://stackoverflow.com/questions/41924713/node-js-socket-io-page-refresh-multiple-connections
    // TODO: Make sure this is ok
    // const socket = io({transports: ['websocket'], upgrade: false});
    const socket = io();
    attachListeners(socket, gameId);

    return socket;
  }
};
