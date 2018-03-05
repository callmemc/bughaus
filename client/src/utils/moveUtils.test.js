import {
  getMoveNotation
} from './moveUtils';

describe('getMoveNotation', () => {
  describe('moving a pawn', () => {
    it('handles a move', () => {
      expect(getMoveNotation({
        piece: 'p',
        from: 'e2',
        to: 'e4'
      })).toEqual('e4');
    });

    it('handles a capture move', () => {
      expect(getMoveNotation({
        piece: 'n',
        from: 'g1',
        to: 'f3',
        isCaptureMove: true
      })).toEqual('Nxf3');
    });
  });

  describe('moving a non-pawn piece', () => {
    it('handles a move', () => {
      expect(getMoveNotation({
        piece: 'n',
        from: 'g1',
        to: 'f3'
      })).toEqual('Nf3');
    });

    it('handles a capture move', () => {
      expect(getMoveNotation({
        piece: 'n',
        from: 'g1',
        to: 'f3',
        isCaptureMove: true
      })).toEqual('Nxf3');
    });
  });

  it('adds an indicator to a drop move', () => {
    expect(getMoveNotation({
      to: 'c5',
      droppedPiece: 'b'
    })).toEqual('Bc5*');
  });
});
