import { dropPieceFromReserve } from './dropPiece';

describe('when dropping a piece from the reserve legally', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 3,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "e2",
        "square": "e2",
        "piece": "p",
        "color": "w"
      }
    ],
    wCaptured: '', bCaptured: '', wDropped: [], bDropped: []
  };

  const RESULT = dropPieceFromReserve(
    {
      boardNum: 0,
      index: 1,
      to: 'f6',
      pieceType: 'n',
      lastPosition: STARTING_POSITION
    }
  );

  const resultPosition = RESULT.data.newPosition;
  expect(resultPosition.wDropped).toEqual([1]);

  expect(resultPosition.board.find(({ square }) => square === 'f6'))
    .toEqual(
      {
        "color": "w",
        "key": "drop_1",
        "piece": "n",
        "square": "f6"
      }
    );

  expect(RESULT.data.move).toEqual(
    { to: 'f6', notation: 'N@f6' }
  );

  expect(resultPosition.fen)
    .toEqual('rnbqkbnr/pppppppp/5N2/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1');
});

describe('when dropping a piece on another piece', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 3,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "e2",
        "square": "e2",
        "piece": "p",
        "color": "w"
      }
    ],
    wCaptured: '', bCaptured: '', wDropped: [], bDropped: []
  };

  it('should not create an action', () => {
    expect(dropPieceFromReserve(
      {
        boardNum: 0,
        index: 1,
        to: 'e2',
        pieceType: 'n',
        lastPosition: STARTING_POSITION
      }
    )).toEqual(undefined);
  });
});

describe('when dropping a pawn', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 3,
    fen: '8/pppppppp/8/8/8/8/PPPPPPPP/8 w KQkq - 0 1',
    board: [],
    wCaptured: 'pp', bCaptured: '', wDropped: [], bDropped: []
  };

  it('should not create an action when dropping on the first row', () => {
    expect(dropPieceFromReserve(
      {
        boardNum: 0,
        index: 0,
        to: 'e1',
        pieceType: 'p',
        lastPosition: STARTING_POSITION
      }
    )).toEqual(undefined);
  });

  it('should not create an action when dropping on the last row', () => {
    expect(dropPieceFromReserve(
      {
        boardNum: 0,
        index: 0,
        to: 'e8',
        pieceType: 'p',
        lastPosition: STARTING_POSITION
      }
    )).toEqual(undefined);
  });
});

describe('when in check', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 3,
    fen: 'rnbqkbnr/ppppp1pp/5p2/7Q/8/4P3/PPPP1PPP/RNB1KBNR b KQkq - 0 1',
    board: [],
    wCaptured: '', bCaptured: '', wDropped: [], bDropped: []
  };

  describe('and dropping a piece that does not block the check', () => {
    const RESULT = dropPieceFromReserve(
      {
        boardNum: 0,
        index: 1,
        to: 'h6',
        pieceType: 'p',
        lastPosition: STARTING_POSITION
      }
    );

    it('should not create an action', () => {
      expect(RESULT).toEqual(undefined);
    });
  });

  describe('and dropping a piece that does block the check', () => {
    const RESULT = dropPieceFromReserve(
      {
        boardNum: 0,
        index: 1,
        to: 'g6',
        pieceType: 'p',
        lastPosition: STARTING_POSITION
      }
    );

    it('should create an action', () => {
      expect(RESULT.data.move).toEqual(
        { to: 'g6', notation: 'P@g6' }
      );
    });
  });
});

describe('when making a move that checkmates', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 5, wCaptured: '', bCaptured: '', wDropped: [], bDropped: [],
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1', board: []
  };

  it('should return a move action with the winner object', () => {
     const RESULT = dropPieceFromReserve(
      {
        boardNum: 0,
        index: 1,
        to: 'f7',
        pieceType: 'q',
        lastPosition: STARTING_POSITION
      }
    );

    expect(RESULT.data.winner).toEqual({ color: 'w', boardNum: 0 });
  });
});

describe('when making a move that checkmates but can be blocked', () => {
  const STARTING_POSITION = {
    boardNum: 0, moveIndex: 5, wCaptured: '', bCaptured: '', wDropped: [], bDropped: [],
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1', board: []
  };

  it('should return a move action with an undefined winner', () => {
     const RESULT = dropPieceFromReserve(
      {
        boardNum: 0,
        index: 1,
        to: 'h5',
        pieceType: 'q',
        lastPosition: STARTING_POSITION
      }
    );

    expect(RESULT.data.winner).toEqual(undefined);
  });
});