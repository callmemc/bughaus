import Immutable from 'seamless-immutable';
import reducer from '../game';

const SIMPLE_INITIAL_STATE = Immutable({
  username: 'mimi',
  gameHistory: [
    {
      boardNum: 0,
      board: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    }
  ],
  currentGames: [ { moves: [], wPlayer: 'mimi' }, { moves: [] } ]
});

describe('When selecting a piece on the board', () => {
  const INITIAL_STATE = Immutable({
    username: 'mimi',
    gameHistory: [
      {
        boardNum: 0,
        board: [],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      }
    ],
    currentGames: [
      {
        moves: [{ to: 'e2', color: 'b' }],
        wPlayer: 'mimi',
        bPlayer: 'mimi'
      },
      {
        moves: []
      }
    ]
  });
  describe('when piece is selectable', () => {
    const RESULT_STATE = reducer(INITIAL_STATE, {
      type: 'SELECT_PIECE',
      boardNum: 0,
      color: 'w',
      square: 'e2'
    });

    it('should set the active piece', () => {
      expect(RESULT_STATE.currentGames[0].activePiece).toEqual(
        { type: 'board', square: 'e2' }
      );
    });

    it('should set the active moves array', () => {
      expect(RESULT_STATE.currentGames[0].activeMoves).toEqual(
        [
          {
            color: 'w',
            from: 'e2',
            to: 'e3',
            flags: 'n',
            piece: 'p',
            san: 'e3'
          },
          {
            color: 'w',
            from: 'e2',
            to: 'e4',
            flags: 'b',
            piece: 'p',
            san: 'e4'
          }
        ]
      );
    });
  });

  describe('when is not piece turn', () => {
    const RESULT_STATE = reducer(INITIAL_STATE, {
      type: 'SELECT_PIECE',
      boardNum: 0,
      color: 'b',
      square: 'e7'
    });
    const resultGame = RESULT_STATE.currentGames[0];

    it('should set the active piece', () => {
      expect(resultGame.activePiece).toEqual(undefined);
    });

    it('should set the active moves array', () => {
      expect(resultGame.activeMoves).toEqual(undefined);
    });
  });

  describe('when piece is not owned', () => {
    const COPY_STATE = {
      ...INITIAL_STATE,
      username: 'bob'
    };

    const RESULT_STATE = reducer(COPY_STATE, {
      type: 'SELECT_PIECE',
      boardNum: 0,
      color: 'w',
      square: 'e2'
    });
    const resultGame = RESULT_STATE.currentGames[0];

    it('should set the active piece', () => {
      expect(resultGame.activePiece).toEqual(undefined);
    });

    it('should set the active moves array', () => {
      expect(resultGame.activeMoves).toEqual(undefined);
    });
  });
});

describe('When selecting a piece from the reserve', () => {
  describe('when piece is selectable', () => {
    const RESULT_STATE = reducer(SIMPLE_INITIAL_STATE, {
      type: 'SELECT_PIECE',
      boardNum: 0,
      color: 'w',
      square: 'e2'
    });

    it('should set the active piece', () => {
      expect(RESULT_STATE.currentGames[0].activePiece).toEqual(
        { type: 'board', square: 'e2' }
      );
    });

    it('should set the active moves array', () => {
      expect(RESULT_STATE.currentGames[0].activeMoves).toEqual(
        [
          {
            color: 'w',
            from: 'e2',
            to: 'e3',
            flags: 'n',
            piece: 'p',
            san: 'e3'
          },
          {
            color: 'w',
            from: 'e2',
            to: 'e4',
            flags: 'b',
            piece: 'p',
            san: 'e4'
          }
        ]
      );
    });
  });
});

describe('When selecting a move to be promoted', () => {
  const RESULT_STATE = reducer(SIMPLE_INITIAL_STATE, {
    type: 'SELECT_PROMOTING_PIECE',
    boardNum: 0,
    from: 'e7',
    to: 'e8',
    pieces: ['n', 'q', 'r', 'b']
  });

  it('should set the active promotion', () => {
    expect(RESULT_STATE.currentGames[0].activePromotion).toEqual(
      {
        from: 'e7',
        to: 'e8',
        pieces: ['n', 'q', 'r', 'b']
      }
    );
  });
});

