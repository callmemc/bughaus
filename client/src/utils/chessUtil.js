import _ from 'lodash';
import { getSquare } from './moveUtils';

export function getChessData(chess) {
  return {
    inCheckmate: inCheckmate(chess),
    inCheck: chess.in_check(),
    turn: chess.turn()
  };
}

export function inCheckmate(chess) {
  if (!chess.in_checkmate()) {
    return false;
  }

  const board = chess.board();
  const turn = chess.turn();

  // Check if 'checkmated' player can block checkmate with a dropped piece
  // Naive implementation: Iterate through all empty squares and see if putting a piece
  //  on the square blocks the check
  const canBlockCheckmate = _.some(board, (rank, rankIndex) => {
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

  return !canBlockCheckmate;
}