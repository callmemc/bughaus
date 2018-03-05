import {
  getNewPosition,
  getReserve
} from './positionUtils';

// See https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests

describe('getNewPosition', () => {
  const BOARD_NUM = 0;
  const MOVE_DATA = {
    capturedPiece: 'p',
    moveColor: 'w',
    droppedPieceIndex: 1,
    fen: 'NEW_FEN',
    move: {
      from: 'e4',
      to: 'd5'
    }
  };
  const GAME_HISTORY = [
    {
      boardNum: 0,
      fen: '',
      board: [],
      moveIndex: 7,
      wCaptured: 'npbp',
      bCaptured: 'p',
      wDropped: [3],
      bDropped: [1]
    },
    {
      boardNum: 1,
      fen: '',
      board: [],
      moveIndex: 5,
      wCaptured: 'p',
      bCaptured: 'bp',
      wDropped: [],
      bDropped: []
    }
  ];
  let newPosition;

  beforeAll(() => {
    newPosition = getNewPosition(MOVE_DATA, BOARD_NUM, GAME_HISTORY);
  });

  it('updates the captured queues', () => {
    expect(newPosition.wCaptured).toEqual('npbp');
    expect(newPosition.bCaptured).toEqual('pp');
  });

  it('updates the dropped arrays', () => {
    expect(newPosition.wDropped).toEqual([3, 1]);
    expect(newPosition.bDropped).toEqual([1]);
  });

  it('increments the moveIndex', () => {
    expect(newPosition.moveIndex).toEqual(8);
  });

  it('updates the other attributes', () => {
    expect(newPosition.fen).toEqual('NEW_FEN');
    expect(newPosition.boardNum).toEqual(0);
  });
});


describe('getReserve', () => {
  it('handles an empty captured queue', () => {
    expect(getReserve('', [])).toEqual('');
  });

  it('removes a dropped pieces from the captured queue', () => {
    expect(getReserve('nbp', [1])).toEqual('np');
  })

  it('removes multiple dropped pieces from the captured queue', () => {
    expect(getReserve('nbpp', [0, 1])).toEqual('pp');
  });
});
