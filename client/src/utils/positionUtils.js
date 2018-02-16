import _ from 'lodash';
import Immutable from 'seamless-immutable';

/**
Position object looks like this:
{
  boardNum: 0,
  moveIndex: 3,
  fen: '...',
  board: [...],
  wCaptured: '...',
  bCaptured: '...',
  wDropped: 'p',
  bDropped: 'p'
}
**/
export function getNewPosition(data, boardNum, history) {
  const { capturedPiece, moveColor, droppedPieceIndex, fen } = data;
  const lastBoardPosition = _.findLast(history, position =>
    position.boardNum === boardNum);

  let { wCaptured, bCaptured, wDropped, bDropped, moveIndex } = lastBoardPosition;

  if (capturedPiece) {
    if (moveColor === 'w') {
      bCaptured = bCaptured + capturedPiece;
    } else {
      wCaptured = wCaptured + capturedPiece;
    }
  }

  if (droppedPieceIndex !== undefined)  {
    if (moveColor === 'w') {
      wDropped = wDropped.concat(droppedPieceIndex);
    } else {
      bDropped = bDropped.concat(droppedPieceIndex);
    }
  }

  return {
    boardNum,
    moveIndex: moveIndex + 1,
    fen,
    board: getNewBoard(boardNum, lastBoardPosition.board, data, history),
    wCaptured,
    bCaptured,
    wDropped,
    bDropped
  };
}

function getNewBoard(boardNum, lastBoard, { move, droppedPiece, capturedPiece, capturedSquare, moveColor }, history) {
  let newBoard = lastBoard;

  // Update taken piece
  // Note: Keeping null piecePositions so element positions don't get moved... this is ugly
  if (capturedPiece) {
    const takenPieceIndex = newBoard.findIndex(piece => piece && piece.square === capturedSquare);
    newBoard = Immutable.set(newBoard, takenPieceIndex, null);
  }

  // Update moved piece
  if (move.from) {
    const pieceIndex = newBoard.findIndex(piece => piece && piece.square === move.from);
    newBoard = Immutable.setIn(newBoard, [pieceIndex, 'square'], move.to);
  // Update dropped piece
  } else {
    newBoard = newBoard.concat({
      key: `drop_${history.length}`,    // key must be unique
      square: move.to,
      piece: droppedPiece,
      color: moveColor
    });
  }

  return newBoard;
}

/**
 * @param {string} captured - Concatenates all captured pieces, in the order they were captured
 * @param {Array} droppedArr - Indexes of pieces in captured string that were dropped
 */
export function getReserve(capturedStr, droppedArr) {
  let result = capturedStr;
  for (let i = droppedArr.length - 1; i >= 0; i--) {
    const droppedIndex = droppedArr[i];
    result = result.slice(0, droppedIndex) + result.slice(droppedIndex + 1);
  }

  return result;
}