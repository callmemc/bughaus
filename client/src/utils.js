import shortid from 'shortid';

export function generateGameId() {
  // Generate random string for game id
  return shortid.generate();
}

export function getTeam({color, boardNum}) {
  if ((color === 'w' && boardNum === 0) ||
    (color === 'b' && boardNum === 1)) {
    return 1;
  } else {
    return 2;
  }
}

export function getOpposingBoardNum(boardNum) {
  return boardNum === 0 ? 1 : 0;
}

export function getOpposingColor(color) {
  return color === 'w' ? 'b' : 'w';
}

export function isMove(square, moves) {
  return !!(moves && moves.find(move => move.to === square));
}

export function removeFromReserve(reserve, index) {
  return reserve.substring(0, index) + reserve.substring(index + 1);
}
