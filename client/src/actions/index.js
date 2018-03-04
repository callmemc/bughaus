export function requestGame(gameId) {
  return {
    type: 'REQUEST_GAME',
    gameId
  };
}

export function receiveGame(gameId, json) {
  return {
    type: 'RECEIVE_GAME',
    gameId,
    json
  };
}

export function receiveGameUpdate(data) {
  return {
    type: 'RECEIVE_GAME_UPDATE',
    data
  };
}

export function fetchGame(gameId) {
  return function(dispatch) {
    // App state is updated to inform that the API call is starting
    dispatch(requestGame(gameId));

    return fetch(`/api/game/${gameId}`, {
      // Initial server request initiates the session middleware on server
      credentials: 'include'
    })
    .then(response => response.json(),
      error => console.log('An error occurred.', error))
    .then(json =>
      // Update the app state with the results of the API call
      dispatch(receiveGame(gameId, json))
    );
  };
}

export function move(boardNum, data) {
  return {
    type: 'MOVE',
    boardNum,
    data
  };
}

export function receiveMove(boardNum, data) {
  return {
    type: 'RECEIVE_MOVE',
    boardNum,
    data
  };
}

export function setUsername(username) {
  return {
    type: 'SET_USERNAME',
    username
  };
}

export function join(color, boardNum, username, isConnected) {
  return {
    type: 'JOIN',
    color,
    boardNum,
    username,
    isConnected
  };
}

export function receiveJoin(color, boardNum, username, isConnected) {
  return {
    type: 'RECEIVE_JOIN',
    color,
    boardNum,
    username,
    isConnected
  };
}

export function clearData() {
  return {
    type: 'CLEAR_DATA'
  };
}
