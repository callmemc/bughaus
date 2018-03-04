import Immutable from 'seamless-immutable';
import _ from 'lodash';

const initialState = Immutable({
  gamesById: []
});

// https://github.com/reactjs/redux/issues/749#issuecomment-141570236
// Dependent on game state
export default (state = initialState, action, gameState) => {
  switch (action.type) {
    case 'RECEIVE_GAME':
      return Immutable.set(
        state,
        'gamesById',
        getUIState(action.json)
      );

    case 'FLIP_BOARD':
      return Immutable.updateIn(
        state,
        ['gamesById', action.boardNum, 'isFlipped'],
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
    state = Immutable.set(
      state,
      'gamesById',
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
