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

export function getSquare(rankIndex, fileIndex, flipped=false) {
  const fileNum = flipped ? 8 - fileIndex : fileIndex + 1;
  const rankNum = flipped ? rankIndex + 1 : 8 - rankIndex;
  return String.fromCharCode(96 + fileNum) + rankNum;
}

export function getIndexes (square, flipped=false) {
  const fileChar = square[0];
  const fileNum = fileChar.charCodeAt() - 96;
  const fileIndex = flipped ? 8 - fileNum : fileNum - 1;
  const rankChar = square[1];
  const rankIndex = flipped ? Number(rankChar) - 1 : 8 - Number(rankChar);
  return { rankIndex, fileIndex };
}

/**
 *  Returns move in Algebraic Notation
 *   See https://en.wikipedia.org/wiki/Bughouse_chess#Notation_and_sample_game
 */
export function getDropMoveNotation({ pieceType, to }) {
  return `${pieceType.toUpperCase()}@${to}`;
}

export function getEnpassantSquare(destSquare, color) {
  const rankDiff = color === 'w' ? -1 : 1;
  return destSquare[0] + (Number(destSquare[1]) + rankDiff);
}
