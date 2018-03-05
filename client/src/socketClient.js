import io from 'socket.io-client';

import { getOpposingColor } from './utils/moveUtils';
import { receiveMove, receiveJoin, receiveGameUpdate } from './actions';

let socket = null;

/**
 * Emit messages
 */
export function socketMiddleware(store) {
  return next => action => {
    const result = next(action);

    if (action.type === 'MOVE') {
      if (!socket) { return console.error('socket was not initialized'); }
      socket.emit('move', {
        data: action.data,
        boardNum: action.boardNum,

        // TODO: gameData vs. moveData object?
        nextColor: getOpposingColor(action.data.moveColor),
        isCapture: action.data.isCapture
      });
    }

    if (action.type === 'JOIN') {
      if (!socket) { return console.error('socket was not initialized'); }
      socket.emit('join', {
        boardNum: action.boardNum,
        color: action.color,
        username: action.username,
        isConnected: action.isConnected
      });
    }

    if (action.type === 'SET_USERNAME') {
      if (!socket) { return console.error('socket was not initialized'); }
      socket.emit('setUsername', {
        username: action.username
      });
    }

    return result;
  };
}

/**
 * Receive messages
 */
export default function(gameId, dispatch) {
  // Prevent the initial HTTP polling.  solution
  // See https://stackoverflow.com/questions/41924713/node-js-socket-io-page-refresh-multiple-connections
  // TODO: Make sure this is ok
  // const socket = io({transports: ['websocket'], upgrade: false});
  socket = io(undefined, { query: `gameId=${gameId}`});

  socket.on('pushMove', message => {
    dispatch(receiveMove(message.boardNum, message.data));
  });

  socket.on('pushJoin', message => {
    dispatch(receiveJoin(message.color, message.boardNum, message.username, message.isConnected));
  });

  socket.on('updateGame', data => {
    dispatch(receiveGameUpdate(data));
  });

  return socket;
};
