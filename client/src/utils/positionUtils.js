import _ from 'lodash';
import getNewBoard from './boardUtil';

/**
 * Returns a new <HistoryObject> generated from a move
 *
 * The <HistoryObject> stores a snapshot of the game after a move
 * {
 *   boardNum: <0, 1>,
 *   moveIndex: <num>,
 *   fen: '<String>',
 *   board: [<Array>],
 *   wCaptured: '<String>',
 *   bCaptured: '<String>',
 *   wDropped: [<Array>],
 *   bDropped: [<Array>]
 * }
**/
export function getNewPosition(moveData, boardNum, history) {
  const { capturedPiece, moveColor, droppedPieceIndex, fen } = moveData;
  const lastPosition = _.findLast(
    history,
    position => position.boardNum === boardNum
  );

  let { wCaptured, bCaptured, wDropped, bDropped, moveIndex } = lastPosition;

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
    board: getNewBoard(lastPosition.board, moveData),
    wCaptured,
    bCaptured,
    wDropped,
    bDropped
  };
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