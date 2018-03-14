import Immutable from 'seamless-immutable';
import reducer from '../game';

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

  describe('calling RECEIVE GAME', () => {
    const RESULT_STATE = reducer(STATE, {
      type: 'RECEIVE_GAME',
      boardNum: 0,
      json: {
        gameHistory: [
          {
            boardNum: 0,
            board: [],
            fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
          },
          {
            boardNum: 1,
            board: [],
            fen: 'rnbqkbnr/ppp1pppp/3p4/1B6/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 0 1'
          }
        ],
        currentGames: [
          {
            moves: [],
          },
          {
            moves: []
          }
        ]
      }
    });

    const { currentGames } = RESULT_STATE;

    it('should update chess data', () => {
      expect(currentGames[0].inCheck).toEqual(false);
      expect(currentGames[0].inCheckmate).toEqual(false);
      expect(currentGames[0].turn).toEqual('w');
      expect(currentGames[1].inCheck).toEqual(true);
      expect(currentGames[1].inCheckmate).toEqual(false);
      expect(currentGames[1].turn).toEqual('b');
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
