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

// Initialize socket and attach listeners
function initialize(gameId) {
  const socket = io();
  attachListeners(socket, gameId);  

  return socket;
}

export default { initialize };

// TODO: Requires socket to be initialized. Is this a bad idea?
// Should the socket be a class instead?
export function move() {

}