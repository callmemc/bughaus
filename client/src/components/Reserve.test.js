import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Reserve from './Reserve';

Enzyme.configure({ adapter: new Adapter() });

describe('Reserve', () => {
  let wrapper;
  beforeAll(() => {
    wrapper = shallow(
      <Reserve
        activeIndex={2}
        color='w'
        queue='npp'
        onSelectPiece={jest.fn()} />
    );
  });

  it('should render each piece', () => {
    const pieceComponents = wrapper.find('ReservePiece');
    expect(pieceComponents.length).toBe(3);
    expect(pieceComponents.first().prop('color')).toBe('w');
  });

  it('should highlight the active piece', () => {
    const activePieces = wrapper.find('ReservePiece')
      .findWhere(n => n.prop('isActive'));
    expect(activePieces.length).toBe(1);
    expect(activePieces.prop('index')).toBe(2);
  });
});