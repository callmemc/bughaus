import { createSelector } from 'reselect';
import _ from 'lodash';

import { getReserve } from '../utils/positionUtils';

const gameHistorySelector = state => state.game.gameHistory;
const historyIndexSelector = state => state.game.historyIndex;

/**
 *  Returns the current position a player is viewing, based on the historyIndex
 *   Also returns calculated reserves for the positions
 */
export const currentPositionsSelector = createSelector(
  gameHistorySelector,
  historyIndexSelector,
  (gameHistory, historyIndex) => {
    if (!gameHistory) {
      return;
    }

    const history = gameHistory.slice(0, historyIndex + 1);
    const positions = [
      getLastPosition(0, history),
      getLastPosition(1, history)
    ];

    if (!positions[0] || !positions[1]) {
      return;
    }

    return [
      getCurrentPosition(positions[0], positions[1]),
      getCurrentPosition(positions[1], positions[0])
    ];
  }
);

function getCurrentPosition(position, otherPosition) {
  return {
    position,
    wReserve: getReserve(otherPosition.wCaptured, position.wDropped),
    bReserve: getReserve(otherPosition.bCaptured, position.bDropped)
  };
}

function getLastPosition(boardNum, history) {
  return _.findLast(history, position =>
    position.boardNum === boardNum);
}
