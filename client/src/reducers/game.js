import Immutable from 'seamless-immutable';
import _ from 'lodash';

/**
 * Main store for current game
**/

const initialState = Immutable({
  connections: [{}, {}],
  timers: [{}, {}],
  historyIndex: 1,
  username: undefined
});

export default (state = initialState, action) => {
  switch (action.type) {
    case 'REQUEST_GAME':
      return initialState;

    case 'RECEIVE_GAME':
      return Immutable.merge(
        state,
        [
          action.json,
          { historyIndex: action.json.gameHistory.length - 1 }
        ]
      );

    case 'RECEIVE_GAME_UPDATE':
      return Immutable.merge(state, action.data);

    case 'SET_USERNAME':
      return Immutable.set(state, 'username', action.username);

    // Also see socketMiddleware
    case 'JOIN':
    case 'RECEIVE_JOIN':
      const { boardNum, color, username, isConnected } = action;
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
      const { newPosition, move, winner } = action.data;

      state = Immutable.update(
        state,
        'gameHistory',
        arr => arr.concat(newPosition)
      );

      state = Immutable.updateIn(
        state,
        ['currentGames', action.boardNum, 'moves'],
        arr => arr.concat(move)
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
