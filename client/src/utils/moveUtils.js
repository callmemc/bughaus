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

/**
 *  Returns move in Algebraic Notation
 *
 *  TODO: Implement all rules, including isCheck --> +
 *   See https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
 */
export function getMoveNotation({ piece, from, to, isCaptureMove, droppedPiece }) {
  let notation = to;
  if (isCaptureMove) {
    notation = 'x' + notation;

    if (piece === 'p') {
      notation = from[0] + notation;
    }
  }

  if (piece && piece !== 'p') {
    notation = piece.toUpperCase() + notation;
  }

  if (droppedPiece) {
    notation = notation + '*';

    if (droppedPiece !== 'p') {
      notation = droppedPiece.toUpperCase() + notation;
    }
  }
  return notation;
}