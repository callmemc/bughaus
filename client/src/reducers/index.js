import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import game from './game';
import gameUI, {getStateFromJoin} from './gameUI';
 
// Reducer composition
const combinedReducers = combineReducers({
  game,
  gameUI
});

// See https://redux.js.org/recipes/structuring-reducers/beyond-combinereducers#sharing-data-between-slice-reducers
const crossSliceReducer = (state, action) => {
  switch(action.type) {
    case 'JOIN':
    case 'RECEIVE_JOIN' : {
      return {
        ...state,
        gameUI : getStateFromJoin(state.gameUI, state.game)
      }
    }
    default:
      return state;
  }
}
 
export default reduceReducers(combinedReducers, crossSliceReducer);
