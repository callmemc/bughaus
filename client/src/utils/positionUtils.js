import Immutable from 'seamless-immutable';
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
export function getNewPosition(moveData, boardNum, lastPosition) {
  const { captured, color, droppedPieceIndex, fen } = moveData;
  let { wCaptured, bCaptured, wDropped, bDropped, moveIndex } = lastPosition;

  if (captured) {
    if (color === 'w') {
      bCaptured = bCaptured + captured;
    } else {
      wCaptured = wCaptured + captured;
    }
  }

  if (droppedPieceIndex !== undefined)  {
    if (color === 'w') {
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

  const sortedDroppedIndexes = Immutable.asMutable(droppedArr)
    .sort((a, b) => b - a);

  sortedDroppedIndexes.forEach(i => {
    result = result.slice(0, i) + result.slice(i + 1);
  });

  return result;
}
