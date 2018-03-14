import chessjs from '../chess.js';
import { getNewPosition } from '../utils/positionUtils';
import {
  getEnpassantSquare,
  getDropMoveNotation,
} from '../utils/moveUtils';
import { getChessData } from '../utils/chessUtil';

/**
 *  Action Creators that invoke the 'MOVE' action
 */

/**
 *  Drop piece onto the board
 *
 *  @param {string} from - Square moved from
 *  @param {string} to - Square moving to
 */
export function dropPiece({ boardNum, from, to, promotion, lastPosition }) {
  const chess = new chessjs.Chess(lastPosition.fen);
  const moveResult = chess.move({ from, to, promotion });

  if (!moveResult) {
    return;
  }

  let { color, captured, flags } = moveResult;

  // If move captures a promoted piece, turn captured piece back to pawn
  if (captured && flags !== 'e') {
    const { promotion } = lastPosition.board.find(
      piece => piece.square === to
    );

    if (promotion) {
      captured = 'p';
    }
  }

  const newPosition = getNewPosition(
    {
      captured,
      color,
      from,
      to,
      promotion,
      fen: chess.fen(),
      ...flags === 'e' && {
        eSquare: getEnpassantSquare(to, color)
      }
    },
    boardNum,
    lastPosition
  );

  const chessData = getChessData(chess);

  return {
    type: 'MOVE',
    boardNum,
    data: {
      newPosition,
      move: {
        from,
        to,
        notation: moveResult.san
      },
      ...chessData.inCheckmate && { winner: { boardNum, color } },

      // Data for socket
      moveColor: color,
      isCapture: !!captured
    },
    chessData
  };
}

/**
 *  Drop piece from reserve onto the board
 *
 *  @param {number} index - Index in dropped piece array
 *  @param {string} to - Square dropped
 */
export function dropPieceFromReserve({ boardNum, index, to, pieceType, lastPosition }) {
  const chess = new chessjs.Chess(lastPosition.fen);

  // Disallow dropping on another piece
  if (chess.get(to)) {
    return;
  }

  const color = chess.turn();

  // Disallow dropping pawns on first or back row
  const rank = to[1];
  if (pieceType === 'p' && (rank === '8' || rank === '1')) {
    return;
  }

  const moveResult = chess.put({ type: pieceType, color }, to);

  if (!moveResult) {
    return;
  }

  // Don’t allow player to drop piece that doesn’t block an existing check
  if (chess.in_check()) {
    return;
  }

  // Have to manually modify fen. TODO: Think about forking chess.js
  const tokens = chess.fen().split(' ');
  tokens[1] = (tokens[1] === 'w') ? 'b' : 'w';    // Advance turn
  tokens[3] = '-';                                // Clear en passant square
  chess.load(tokens.join(' '), {force: true});

  const newPosition = getNewPosition(
    {
      color,
      droppedPieceIndex: index,
      droppedPiece: pieceType,
      to,
      fen: chess.fen()
    },
    boardNum,
    lastPosition
  );

  const chessData = getChessData(chess);

  return {
    type: 'MOVE',
    boardNum,
    data: {
      newPosition,
      move: {
        to,
        notation: getDropMoveNotation({ pieceType, to })
      },
      ...chessData.inCheckmate && { winner: { boardNum, color } },

      // Data for socket
      moveColor: color,
      isCapture: false
    },

    chessData: getChessData(chess)
  };
}
