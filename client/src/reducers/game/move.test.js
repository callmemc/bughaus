import Immutable from 'seamless-immutable';
import _ from 'lodash';
import reducer from '../game';

const INITIAL_STATE = Immutable({
  username: 'mimi',
  historyIndex: 0,
  gameHistory: [
    {
      boardNum: 0,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    }
  ],
  currentGames: [
    {
      activePiece: { type: 'board', square: 'e2' },
      activeMoves: [{ square: 'e4' }],
      moves: [],
      wPlayer: 'mimi'
    },
    {
      moves: []
    }
  ]
});

describe('After making a move', () => {
  const RESULT_STATE = reducer(INITIAL_STATE, {
    type: 'MOVE',
    boardNum: 0,
    data: {
      newPosition: {
        boardNum: 0,
        board: [],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      },
      move: { to: 'e4' },
      winner: { boardNum: 0, color: 'w' }
    },
    chessData: { inCheckmate: true, inCheck: false, turn: 'b' }
  });

  const currentGame = RESULT_STATE.currentGames[0];

  it('should clear the active move state', () => {
    expect(currentGame.activePiece).toEqual(undefined);
  });

  it('should add the move to the end of the moves array', () => {
    expect(_.last(currentGame.moves)).toEqual({ to: 'e4' });
  });

  it('should add the new position to the end of the game history', () => {
    expect(_.last(RESULT_STATE.gameHistory)).toEqual(
      {
        boardNum: 0,
        board: [],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    );
  });

  it('should update the history index to the last', () => {
    expect(RESULT_STATE.historyIndex).toEqual(1);
  });

  it('should update chess data', () => {
    expect(currentGame.inCheckmate).toEqual(true);
    expect(currentGame.inCheck).toEqual(false);
    expect(currentGame.turn).toEqual('b');
  });

  it('should update winner', () => {
    expect(RESULT_STATE.winner).toEqual(
      { boardNum: 0, color: 'w' }
    );
  });
});
