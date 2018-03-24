import Immutable from 'seamless-immutable';
import { currentPositionsSelector } from './index';

const gameState = Immutable({
  historyIndex: 3,
  gameHistory: [
    {
      boardNum: 0,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      wCaptured: 'np', bCaptured: 'bp', wDropped: [], bDropped: []
    },
    {
      boardNum: 1,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      wCaptured: '', bCaptured: 'pp', wDropped: [0], bDropped: [1]
    },
    {
      boardNum: 1,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      wCaptured: 'n', bCaptured: 'pp', wDropped: [0], bDropped: [1]
    },
    {
      boardNum: 0,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      wCaptured: 'npp', bCaptured: 'bp', wDropped: [], bDropped: [1]
    }
  ]
});

let state;


describe('currentPositionsSelector', () => {
  beforeEach(() => {
    state = { game: gameState };
  });

  test('should calculate the reserves correctly on the last history position', () => {
    const positionObject = currentPositionsSelector(state);
    expect(positionObject[0].wReserve).toEqual('n');
    expect(positionObject[0].bReserve).toEqual('p');
    expect(positionObject[1].wReserve).toEqual('pp');
    expect(positionObject[1].bReserve).toEqual('b');
  });

  test('should calculate the reserves correctly on another history position', () => {
    state = Immutable.setIn(state, ['game', 'historyIndex'], 1);
    const positionObject = currentPositionsSelector(state);
    expect(positionObject[0].wReserve).toEqual('');
    expect(positionObject[0].bReserve).toEqual('pp');
    expect(positionObject[1].wReserve).toEqual('p');
    expect(positionObject[1].bReserve).toEqual('b');
  });
});