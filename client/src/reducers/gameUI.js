import Immutable from 'seamless-immutable';
import _ from 'lodash';

const initialState = Immutable([{}, {}]);

// https://github.com/reactjs/redux/issues/749#issuecomment-141570236
// Dependent on game state
export default (state = initialState, action, gameState) => {
  const { boardNum } = action;

  switch (action.type) {
    case 'RECEIVE_GAME':
      return Immutable.merge(
        state,
        getUIState(action.json)
      );

    case 'FLIP_BOARD':
      return Immutable.updateIn(
        state,
        [boardNum, 'isFlipped'],
        value => !value
      );

    default:
      return state;
  }
}

export function getStateFromJoin(state, gameState) {
  // TODO: selector
  const allConnected = _.get(gameState.connections, 'length') === 2 &&
    _.every(gameState.connections, board => board.w && board.b);

  if (allConnected) {
    state = Immutable.merge(
      state,
      getUIState(gameState)
    );
  }
  return state;
}

function getUIState(gameState) {
  const { username, currentGames } = gameState;
  const flipBoard0 = username === currentGames[0].bPlayer &&
    !(username === currentGames[0].wPlayer);
  const flipBoard1 = (username === currentGames[1].bPlayer || !flipBoard0) &&
    username !== currentGames[1].wPlayer;

  return [
    {
      isFlipped: flipBoard0
    },
    {
      isFlipped: flipBoard1
    }
  ];
}
