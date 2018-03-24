import React from 'react';
import { shallow } from 'enzyme';
import configureStore from 'redux-mock-store';
import { GamePage, ConnectedGamePage } from './GamePage';

describe('GamePage', () => {
  const setup = (setupProps = {}) => {
    const defaultProps = {
      onFetchGame: jest.fn(),
      onSelectPlayer: jest.fn(),
      match: { params: { gameId: 'abc' } }
    };
    const props = { ...defaultProps, ...setupProps };
    const wrapper = shallow(<GamePage {...props} />);

    return {
      props,
      wrapper
    };
  }

  it('renders without crashing', () => {
    const { props, wrapper } = setup();
    expect(props.onFetchGame).toHaveBeenCalled();
    expect(wrapper.find('ChessGame').length).toBe(0);
  });

  describe('with games', () => {
    const PROPS = {
      currentPositions: [
        {
          position: 'Test Position 0'
        },
        {
          position: 'Test Position 1',
          wReserve: 'p',
          bReserve: 'n'
        }
      ],
      currentGames: [
        { moves: 'Test Moves 1', wPlayer: 'mimi' },
        { moves: 'Test Moves 2' }
      ]
    };

    const { props, wrapper } = setup(PROPS);
    const ChessGames = wrapper.find('Connect(ChessGame)');

    it('renders two chess games', () => {
      // TODO: Use a snapshot to test this instead
      expect(ChessGames.length).toBe(2);
    });

    it('renders the first chess game with the correct props', () => {
      expect(ChessGames.first()).toHaveProp({
        boardNum: 0,
        position: 'Test Position 0',
        moves: 'Test Moves 1'
      })
    });

    it('renders the second chess game with the correct props', () => {
      expect(ChessGames.at(1)).toHaveProp({
        boardNum: 1,
        position: 'Test Position 1',
        moves: 'Test Moves 2'
      });
    });

    it('renders the second chess game with the correct reserves', () => {
      expect(ChessGames.at(1)).toHaveProp({
        wReserve: 'p',
        bReserve: 'n'
      });
    });
  });
});

describe('ConnectedGamePage', () => {
  const STORE_STATE = {
    game: {
      username: 'Test Name',
      connections: 'Test Connections',
      timers: 'Test Timers',
      winner: 'Test Winner',
      currentGames: 'Test Current Games'
    },
    gameUI: 'Test Game UI'
  };
  const setup = () => {
    const store = configureStore()(STORE_STATE);
    const wrapper = shallow(<ConnectedGamePage store={store} />);

    return {
      wrapper
    };
  }

  it('passes props to the GamePage component', () => {
    const { wrapper } = setup();
    const GamePage = wrapper.find('GamePage');
    expect(GamePage).toExist();
    expect(GamePage).toHaveProp({
      username: 'Test Name',
      connections: 'Test Connections',
      timers: 'Test Timers',
      winner: 'Test Winner',
      currentGames: 'Test Current Games',
    });
    expect(GamePage).toHaveProp('gameUI', 'Test Game UI');
  });
});