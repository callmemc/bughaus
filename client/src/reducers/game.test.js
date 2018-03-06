import Immutable from 'seamless-immutable';
import reducer from './game';

describe('game reducer', () => {
  const STATE = Immutable({
    connections: [{}, {}],
    timers: [{}, {}],
    historyIndex: 1,
    username: undefined,
    gameHistory: [{ board: [] }],
    currentGames: [
      { moves: [{ to: 'e2', color: 'b' }] },
      { moves: [] }
    ]
  });

  describe('calling MOVE', () => {
    const RESULT_STATE = reducer(STATE, {
      type: 'MOVE',
      boardNum: 0,
      data: {
        newPosition: {'this': 'is a test'},
        move: {to: 'e4', color: 'b'}
      }
    });

    it('should append game history', () => {
      expect(RESULT_STATE.gameHistory).toEqual(
        STATE.gameHistory.concat({'this': 'is a test'})
      );
    });

    it('should append the move', () => {
      expect(RESULT_STATE.currentGames[0].moves).toEqual(
        [{ to: 'e2', color: 'b' }, { to: 'e4', color: 'b' }]
      );
    });

    it('should update historyIndex', () => {
      expect(RESULT_STATE.historyIndex).toEqual(1);
    });
  });

  describe('calling JOIN', () => {
    const RESULT_STATE = reducer(STATE, {
      type: 'JOIN',
      boardNum: 0,
      username: 'mimi',
      color: 'w',
      isConnected: true
    });

    it('should add a connection', () => {
      expect(RESULT_STATE.connections[0].w).toEqual(true);
    });

    it("should add the player's username", () => {
      expect(RESULT_STATE.currentGames[0].wPlayer).toEqual('mimi');
    });
  });
});
