import io from 'socket.io-client';

// function attachListeners(socket, gameId) {
//   socket.on('connect', (data) => {
//   });
// }

export default {
  initialize: function(gameId) {
    // Prevent the initial HTTP polling.  solution
    // See https://stackoverflow.com/questions/41924713/node-js-socket-io-page-refresh-multiple-connections
    // TODO: Make sure this is ok
    // const socket = io({transports: ['websocket'], upgrade: false});
    const socket = io(undefined, { query: `gameId=${gameId}`});
    // attachListeners(socket, gameId);

    return socket;
  }
};
