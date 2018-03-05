import Immutable from 'seamless-immutable';

/**
 * Returns a new <BoardPositions> array generated from a move
 *
 * The <BoardPositions> stores all the positions of pieces on the board
 *
 * {
 *   key: '<String>',
 *   square: '<String>',
 *   piece: '<Char>',
 *   color: '<w, b>'
 * }
**/
export default function getNewBoard(lastBoard, moveData) {
  const { move, droppedPiece, capturedSquare, moveColor, promotionPiece } = moveData;
  let newBoard = lastBoard;

  // Update taken piece
  // Note: Keeping null piecePositions as a HACK so element positions don't get moved
  if (capturedSquare) {
    const takenPieceIndex = newBoard.findIndex(piece => piece.square === capturedSquare);

    newBoard = Immutable.setIn(
      newBoard,
      [takenPieceIndex, 'piece'],
      null
    );
  }

  // Update moved piece
  if (move.from) {
    const pieceIndex = newBoard.findIndex(piece => piece.square === move.from);
    newBoard = Immutable.setIn(
      newBoard,
      [pieceIndex, 'square'],
      move.to
    );
    // Promotion piece
    if (promotionPiece) {
      newBoard = Immutable.setIn(
        newBoard,
        [pieceIndex, 'promotion'],
        promotionPiece
      );
    }
  // Update dropped piece
  } else {
    newBoard = newBoard.concat({
      key: `drop_${newBoard.length}`,    // key must be unique
      square: move.to,
      piece: droppedPiece,
      color: moveColor
    });
  }

  return newBoard;
}