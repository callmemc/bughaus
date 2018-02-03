import shortid from 'shortid';
import _ from 'lodash';

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

export function getSquare(rankIndex, fileIndex, flipped=false) {
  const fileNum = flipped ? 8 - fileIndex : fileIndex + 1;
  const rankNum = flipped ? rankIndex + 1 : 8 - rankIndex;
  return String.fromCharCode(96 + fileNum) + rankNum;
}

export function canBlockCheckmate(chess) {
  const board = chess.board();
  const turn = chess.turn();

  // Naive implementation: Iterate through all empty squares and see if putting a piece
  //  on the square blocks the check
  return _.some(board, (rank, rankIndex) => {
    return _.some(rank, (piece, fileIndex) => {
      const square = getSquare(rankIndex, fileIndex);
      if (!piece) {
        // Note: piece type doesn't matter -- just checking if any block can be made
        chess.put({ type: 'n', color: turn }, square);
        if (chess.in_check()) {
          chess.remove(square);
          return false;
        } else {
          // If no longer in check, found a block!
          chess.remove(square);
          return true;
        }
      } else {
        return false;
      }
    });
  });
}