import {
  getNewPosition,
  getReserve
} from './positionUtils';

// See https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#running-tests

describe('getNewPosition', () => {
  const BOARD_NUM = 0;
  const MOVE_DATA = {
    captured: 'p',
    color: 'w',
    fen: 'NEW_FEN',
    from: 'e4',
    to: 'd5'
  };
  const LAST_POSITION = {
    boardNum: 0,
    fen: '',
    board: [
      {
        key: 'e4', square: 'e4', piece: 'p', color: 'w'
      },
      {
        key: 'd5', square: 'd5', piece: 'p', color: 'b'
      }
    ],
    moveIndex: 7,
    wCaptured: 'npbp',
    bCaptured: 'p',
    wDropped: [3],
    bDropped: [1]
  };

  let newPosition;

  beforeAll(() => {
    newPosition = getNewPosition(MOVE_DATA, BOARD_NUM, LAST_POSITION);
  });

  it('updates the captured queues', () => {
    expect(newPosition.wCaptured).toEqual('npbp');
    expect(newPosition.bCaptured).toEqual('pp');
  });

  it('updates the dropped arrays', () => {
    expect(newPosition.wDropped).toEqual([3]);
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

  it('removes a dropped piece from the captured queue', () => {
    expect(getReserve('nbp', [1])).toEqual('np');
  })

  it('removes multiple dropped pieces from the captured queue', () => {
    expect(getReserve('nbpp', [0, 1])).toEqual('pp');
    expect(getReserve('nbpp', [1, 3])).toEqual('np');
    expect(getReserve('nbpp', [1, 0])).toEqual('pp');
    expect(getReserve('nbpp', [3, 1])).toEqual('np');
  });
});
