import Immutable from 'seamless-immutable';
import * as sounds from '../../sounds';

export default function(state, action) {
  const { boardNum, chessData } = action;
  const { newPosition, move, winner, isCapture } = action.data;

  // TODO: Move this to middleware
  if (isCapture) {
    sounds.playCaptureSound();
  } else {
    sounds.playMoveSound();
  }

  state = Immutable.update(
    state,
    'gameHistory',
    arr => arr.concat(newPosition)
  );

  state = Immutable.updateIn(
    state,
    ['currentGames', boardNum, 'moves'],
    arr => arr.concat(move)
  );

  // Clear all active move state
  state = Immutable.updateIn(
    state,
    ['currentGames', boardNum],
    val => Immutable.merge(val,
      [
        {
          activePiece: undefined,
          activeMoves: undefined,
          activePromotion: undefined
        },
        chessData
      ]
    )
  );

  // Note: Winner is manually set, rather than calculated from fen, b/c can also lose from timeout
  if (winner) {
    state = Immutable.set(
      state,
      'winner',
      winner
    );
  }

  // Current behavior: After a move, always update to latest move
  state = Immutable.set(
    state,
    'historyIndex',
    state.gameHistory.length - 1
  );

  return state;
}