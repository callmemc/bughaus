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
  const { from, to, droppedPiece, captured, color, promotion } = moveData;
  let newBoard = lastBoard;

  // Update taken piece
  // Note: Keeping null piecePositions as a HACK so element positions don't get moved
  if (captured) {
    const capturedSquare = moveData.eSquare || to;
    const takenPieceIndex = newBoard.findIndex(
      ({ square, piece }) => square === capturedSquare
    );

    newBoard = Immutable.update(
      newBoard,
      takenPieceIndex,
      val => Immutable.merge(val, { square: null, piece: null })
    );
  }

  // Update moved piece
  if (from) {
    const pieceIndex = newBoard.findIndex(piece => piece.square === from);
    newBoard = Immutable.setIn(
      newBoard,
      [pieceIndex, 'square'],
      to
    );
    // Promotion piece
    if (promotion) {
      newBoard = Immutable.setIn(
        newBoard,
        [pieceIndex, 'promotion'],
        promotion
      );
    }
  // Update dropped piece
  } else {
    newBoard = newBoard.concat({
      key: `drop_${newBoard.length}`,    // key must be unique
      square: to,
      piece: droppedPiece,
      color
    });
  }

  return newBoard;
}