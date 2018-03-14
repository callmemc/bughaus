import {
  getDropMoveNotation
} from './moveUtils';

describe('getDropMoveNotation', () => {
  it('adds an indicator to a drop move', () => {
    expect(getDropMoveNotation({
      to: 'c5',
      pieceType: 'b'
    })).toEqual('B@c5');
  });
});
