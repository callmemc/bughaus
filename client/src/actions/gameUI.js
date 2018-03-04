export function flipBoard(boardNum) {
  return {
    type: 'FLIP_BOARD',
    boardNum
  };
}

export function setGameIndex(selection) {
  return {
    type: 'SET_GAME_INDEX',
    selection
  };
}

export function setMoveIndex(boardNum, selection) {
  return {
    type: 'SET_MOVE_INDEX',
    boardNum,
    selection
  };
}
