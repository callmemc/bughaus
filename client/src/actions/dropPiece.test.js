import { dropPiece } from './dropPiece';

describe('when making a normal move', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "e2",
        "square": "e2",
        "piece": "p",
        "color": "w"
      }
    ],
    moveIndex: 0,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  it('should return a move action from a valid move', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'e2',
        to: 'e4',
        lastPosition: STARTING_POSITION
      }
    );

    const resultPosition = RESULT.data.newPosition;
    expect(resultPosition.fen)
      .toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    expect(resultPosition.moveIndex).toEqual(1);
    expect(resultPosition.board.find(({ key }) => key === 'e2'))
      .toEqual(
        {
          "color": "w",
          "key": "e2",
          "piece": "p",
          "square": "e4"
        }
      );
    expect(RESULT.data.move).toEqual(
      { from: 'e2', to: 'e4', notation: 'e4'}
    );
    expect(RESULT.type).toEqual('MOVE');
    expect(RESULT.boardNum).toEqual(0);
    expect(RESULT.chessData).toEqual(
      { inCheckmate: false, inCheck: false, turn: 'b' }
    );
  });

  it('should return undefined from an invalid move', () => {
    expect(dropPiece(
      {
        boardNum: 0,
        from: 'e2',
        to: 'e5',
        lastPosition: STARTING_POSITION
      }
    )).toEqual(undefined);
  });
});describe('when making a normal move', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "e2",
        "square": "e2",
        "piece": "p",
        "color": "w"
      }
    ],
    moveIndex: 0,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  it('should return a move action from a valid move', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'e2',
        to: 'e4',
        lastPosition: STARTING_POSITION
      }
    );

    const resultPosition = RESULT.data.newPosition;
    expect(resultPosition.fen)
      .toEqual('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    expect(resultPosition.moveIndex).toEqual(1);
    expect(resultPosition.board.find(({ key }) => key === 'e2'))
      .toEqual(
        {
          "color": "w",
          "key": "e2",
          "piece": "p",
          "square": "e4"
        }
      );
    expect(RESULT.data.move).toEqual(
      { from: 'e2', to: 'e4', notation: 'e4'}
    );
    expect(RESULT.type).toEqual('MOVE');
    expect(RESULT.boardNum).toEqual(0);
    expect(RESULT.chessData).toEqual(
      { inCheckmate: false, inCheck: false, turn: 'b' }
    );
  });

  it('should return undefined from an invalid move', () => {
    expect(dropPiece(
      {
        boardNum: 0,
        from: 'e2',
        to: 'e5',
        lastPosition: STARTING_POSITION
      }
    )).toEqual(undefined);
  });
});

describe('when making a capture move', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    board: [
      {
        "key": "e2",
        "square": "e4",
        "piece": "p",
        "color": "w"
      },
      {
        "key": "d7",
        "square": "d5",
        "piece": "p",
        "color": "b"
      }
    ],
    moveIndex: 1,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  const RESULT = dropPiece(
    {
      boardNum: 0,
      from: 'e4',
      to: 'd5',
      lastPosition: STARTING_POSITION
    }
  );

  const resultPosition = RESULT.data.newPosition;
  expect(resultPosition.fen)
    .toEqual('rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
  expect(resultPosition.bCaptured).toEqual('p');
  expect(resultPosition.board.find(({ key }) => key === 'e2'))
    .toEqual(
      {
        "color": "w",
        "key": "e2",
        "piece": "p",
        "square": "d5"
      }
    );
  expect(RESULT.data.move).toEqual(
    {
      from: 'e4',
      to: 'd5',
      notation: 'exd5'
    }
  );
});

describe('when making an en passant capture', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3',
    board: [
      {
        "key": "e2",
        "square": "e5",
        "piece": "p",
        "color": "w"
      },
      {
        "key": "f7",
        "square": "f5",
        "piece": "p",
        "color": "b"
      }
    ],
    moveIndex: 3,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  const RESULT = dropPiece(
    {
      boardNum: 0,
      from: 'e5',
      to: 'f6',
      lastPosition: STARTING_POSITION
    }
  );

  const resultPosition = RESULT.data.newPosition;
  expect(resultPosition.bCaptured).toEqual('p');

  expect(resultPosition.board.find(({ key }) => key === 'e2'))
    .toEqual(
      {
        "color": "w",
        "key": "e2",
        "piece": "p",
        "square": "f6"
      }
    );
  expect(resultPosition.board.find(({ key }) => key === 'f7'))
    .toEqual(
      {
        color: "b",
        key: "f7",
        piece: null,
        square: null
      }
    );

  expect(RESULT.data.move).toEqual(
    {
      from: 'e5',
      to: 'f6',
      notation: 'exf6'
    }
  );

  expect(resultPosition.fen)
    .toEqual('rnbqkbnr/ppp1p1pp/5P2/3p4/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 3');
});

describe('when making a normal promotion move', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkb1r/ppp2pPp/4pn2/3p4/8/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "h2",
        "square": "g7",
        "piece": "p",
        "color": "w"
      }
    ],
    moveIndex: 12,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  it('should return a move action', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'g7',
        to: 'g8',
        promotion: 'q',
        lastPosition: STARTING_POSITION
      }
    );

    const resultPosition = RESULT.data.newPosition;

    expect(resultPosition.fen)
      .toEqual('rnbqkbQr/ppp2p1p/4pn2/3p4/8/8/PPPPPPP1/RNBQKBNR b KQkq - 0 1');
    expect(resultPosition.moveIndex).toEqual(13);
    expect(resultPosition.board.find(({ key }) => key === 'h2'))
      .toEqual(
        {
          key: 'h2',
          color: 'w',
          piece: 'p',
          square: 'g8',
          promotion: 'q'
        }
      );

    expect(RESULT.data.move).toEqual(
      {
        from: 'g7',
        to: 'g8',
        notation: 'g8=Q'
      }
    );
    expect(RESULT.type).toEqual('MOVE');
    expect(RESULT.boardNum).toEqual(0);
  });
});

describe('when making a capture promotion move', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/ppp2pPp/8/3pp3/8/8/PPPPPPP1/RNBQKBNR w KQkq - 0 1',
    board: [
      {
        "key": "h2",
        "square": "g7",
        "piece": "p",
        "color": "w"
      },
      {
        "key": "h8",
        "square": "h8",
        "piece": "r",
        "color": "b"
      }
    ],
    moveIndex: 12,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  it('should return a move action', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'g7',
        to: 'h8',
        promotion: 'q',
        lastPosition: STARTING_POSITION
      }
    );

    const resultPosition = RESULT.data.newPosition;

    expect(resultPosition.fen)
      .toEqual('rnbqkbnQ/ppp2p1p/8/3pp3/8/8/PPPPPPP1/RNBQKBNR b KQq - 0 1');
    expect(resultPosition.moveIndex).toEqual(13);
    expect(resultPosition.board.find(({ key }) => key === 'h2'))
      .toEqual(
        {
          key: 'h2',
          color: 'w',
          piece: 'p',
          square: 'h8',
          promotion: 'q'
        }
      );
    expect(resultPosition.board.find(({ key }) => key === 'h8'))
      .toEqual(
        {
          key: 'h8',
          color: 'b',
          piece: null,
          square: null
        }
      );

    expect(RESULT.data.move).toEqual(
      {
        from: 'g7',
        to: 'h8',
        notation: 'gxh8=Q'
      }
    );
    expect(RESULT.type).toEqual('MOVE');
    expect(RESULT.boardNum).toEqual(0);
  });
});

describe('when capturing a promoted piece', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkQnr/pppp1p1p/8/8/8/6p1/PPPPP1PP/RNBQKBNR b KQkq - 0 1',
    board: [
      {
        key: 'h2',
        color: 'w',
        piece: 'p',
        square: 'f8',
        promotion: 'q'
      },
      {
        key: 'e8',
        color: 'b',
        piece: 'k',
        square: 'e8'
      },
      {
        key: 'f8',
        color: 'b',
        piece: null,
        square: null
      }
    ],
    moveIndex: 5,
    wCaptured: '',
    bCaptured: '',
    wDropped: [],
    bDropped: []
  };

  it('should return a move action', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'e8',
        to: 'f8',
        lastPosition: STARTING_POSITION
      }
    );

    const resultPosition = RESULT.data.newPosition;

    expect(resultPosition.fen)
      .toEqual('rnbq1knr/pppp1p1p/8/8/8/6p1/PPPPP1PP/RNBQKBNR w KQ - 0 2');
    expect(resultPosition.moveIndex).toEqual(6);
    expect(resultPosition.board.find(({ key }) => key === 'e8'))
      .toEqual(
        {
          key: 'e8',
          color: 'b',
          piece: 'k',
          square: 'f8'
        }
      );
    expect(resultPosition.board.find(({ key }) => key === 'h2'))
      .toEqual(
        {
          key: 'h2',
          color: 'w',
          piece: null,
          square: null,
          promotion: 'q'
        }
      );

    expect(RESULT.data.move).toEqual(
      {
        from: 'e8',
        to: 'f8',
        notation: 'Kxf8'
      }
    );
    expect(RESULT.type).toEqual('MOVE');
    expect(RESULT.boardNum).toEqual(0);
  });
});

describe('when making a move that checkmates', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/2ppppp1/pp5p/8/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    board: [
      {
        "key": "f1",
        "square": "c4",
        "piece": "b",
        "color": "w"
      },
      {
        "key": "f7",
        "square": "f7",
        "piece": "p",
        "color": "b"
      }
    ],
    moveIndex: 5, wCaptured: '', bCaptured: '', wDropped: [], bDropped: []
  };

  it('should return a move action with the winner object', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'c4',
        to: 'f7',
        lastPosition: STARTING_POSITION
      }
    );

    expect(RESULT.data.winner).toEqual({ color: 'w', boardNum: 0 });
  });
});

describe('when making a move that checkmates but can be blocked', () => {
  const STARTING_POSITION = {
    boardNum: 0,
    fen: 'rnbqkbnr/ppppp2p/5p2/6p1/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1',
    board: [
      {
        "key": "d1",
        "square": "d1",
        "piece": "q",
        "color": "w"
      }
    ],
    moveIndex: 3, wCaptured: '', bCaptured: '', wDropped: [], bDropped: []
  };

  it('should return a move action with an undefined winner', () => {
    const RESULT = dropPiece(
      {
        boardNum: 0,
        from: 'd1',
        to: 'h5',
        lastPosition: STARTING_POSITION
      }
    );

    expect(RESULT.data.winner).toEqual(undefined);
  });
});
