import Immutable from 'seamless-immutable';
import _ from 'lodash';

import chessjs from '../../chess.js';
import { selectPiece, selectPieceFromReserve, selectPromotingPiece } from './selectPiece';
import move from './move';
import { getChessData } from '../../utils/chessUtil';

/**
 * Main store for current game
 *  Minimal state needed to describe game, so that if stored in DB and reloaded
 *  You would have everything you need to know
 *  --> State that concerns ALL players
**/

const initialState = Immutable({
  connections: [{}, {}],
  historyIndex: 1,
  timers: [{}, {}],
  username: undefined
});

function receiveGame(state, action) {
  const gameHistory = action.json.gameHistory;

  state = Immutable.merge(
    state,
    [
      action.json,
      { historyIndex: gameHistory.length - 1 }
    ]
  );

  // Update chess data
  [0, 1].forEach(boardNum => {
    const currentPosition = _.findLast(
      gameHistory,
      position => position.boardNum === boardNum
    );
    if (!currentPosition) {
      return;
    }

    state = Immutable.updateIn(
      state,
      ['currentGames', boardNum],
      val => Immutable.merge(
        val,
        getChessData(new chessjs.Chess(currentPosition.fen))
      )
    );
  });

  return state;
}

export default (state = initialState, action) => {
  const { boardNum } = action;

  switch (action.type) {
    // TODO: isFetching
    case 'REQUEST_GAME':
      return initialState;

    case 'RECEIVE_GAME':
      return receiveGame(state, action);

    case 'RECEIVE_GAME_UPDATE':
      return Immutable.merge(state, action.data);

    case 'SET_USERNAME':
      return Immutable.set(state, 'username', action.username);

    // Also see socketMiddleware
    case 'JOIN':
    case 'RECEIVE_JOIN':
      const { color, username, isConnected } = action;
      state = Immutable.setIn(
        state,
        ['currentGames', boardNum, `${color}Player`],
        username
      );

      state = Immutable.setIn(
        state,
        ['connections', boardNum, color],
        isConnected
      );

      return state;

    // Also see socketMiddleware
    case 'MOVE':
    case 'RECEIVE_MOVE':
      return move(state, action);

    case 'SET_GAME_INDEX':
      let newIndex;
      switch (action.selection) {
        case 'FIRST':
          newIndex = 1;
          break;
        case 'PREV':
          newIndex = state.historyIndex - 1;
          break;
        case 'NEXT':
          newIndex = state.historyIndex + 1;
          break;
        case 'LAST':
          newIndex = state.gameHistory.length - 1;
          break;
        default:
          console.error('Invalid type');
          return state;
      }
      return setIndex(state, newIndex);

    case 'SET_MOVE_INDEX':
      const { gameHistory, historyIndex } = state;

      const { moveIndex } = _.findLast(
        gameHistory.slice(0, historyIndex + 1),
        ({ boardNum }) => boardNum === action.boardNum
      );

      let newMoveIndex;
      if (_.isNumber(action.selection)) {
        newMoveIndex = action.selection;
      } else {
        switch (action.selection) {
          case 'PREV':
            newMoveIndex = moveIndex - 1;
            break;
          case 'NEXT':
            newMoveIndex = moveIndex + 1;
            break;
          default:
            console.error('Invalid type');
            return state;
        }
      }

      const newGameIndex = gameHistory.findIndex(
        ({ boardNum, moveIndex }) =>
          boardNum === action.boardNum && moveIndex === newMoveIndex
      );
      return setIndex(state, newGameIndex);

    case 'SELECT_PIECE':
      return selectPiece(state, action);
      case 'SELECT_PIECE_FROM_RESERVE':
      return selectPieceFromReserve(state, action);
    case 'SELECT_PROMOTING_PIECE':
      return selectPromotingPiece(state, action);

    default:
      return state
  }

  function setIndex(state, newIndex) {
    if (newIndex < 1 || newIndex >= state.gameHistory.length) {
      return state;
    } else {
      return Immutable.set(
        state,
        'historyIndex',
        newIndex
      );
    }
  }
}
