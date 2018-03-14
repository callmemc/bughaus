import Immutable from 'seamless-immutable';
import _ from 'lodash';
import chessjs from '../../chess.js';

export function selectPiece(state, action) {
  const { boardNum, square, color } = action;

  const position = _.findLast(state.gameHistory,
    position => position.boardNum === boardNum
  );
  const chess = new chessjs.Chess(position.fen);

  if (color !== chess.turn() || !isPlayerPiece(state, boardNum, color)) {
    return state;
  }

  return Immutable.updateIn(
    state,
    ['currentGames', boardNum],
    val => Immutable.merge(
      val,
      {
        activePiece: { type: 'board', square },
        activeMoves: chess.moves({ verbose: true, square })
      }
    )
  );
}

export function selectPieceFromReserve(state, action) {
  const { boardNum, index, color, pieceType } = action;

  if (!isPlayerPiece(state, boardNum, color)) {
    return state;
  }

  return Immutable.updateIn(
    state,
    ['currentGames', boardNum],
    val => Immutable.merge(
      val,
      {
        activePiece: { type: 'reserve', pieceType, index, color },
        activeMoves: undefined
      }
    )
  );
}

export function selectPromotingPiece(state, action) {
  // todo: if (color !== chess.turn() || !isPlayerPiece(state, boardNum, color)) {
  const { boardNum, from, to, pieces } = action;

  return Immutable.updateIn(
    state,
    ['currentGames', boardNum],
    val => Immutable.set(
      val,
      'activePromotion',
      { from, to, pieces }
    )
  );
}


function isPlayerPiece(state, boardNum, color) {
  const { username, currentGames } = state;
  const player = currentGames[boardNum][`${color}Player`];

  if (username === player) {    // && if turn (calculate from this.chess)
    return true;
  } else {
    return false;
  }
}
