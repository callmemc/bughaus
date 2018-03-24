import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import _ from 'lodash';
import styled from 'styled-components';
import startGameConnection from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import PlayerSelectionDialog from './components/PlayerSelectionDialog';
import HistoryScrubber from './components/HistoryScrubber';
import { getOpposingBoardNum } from './utils/moveUtils';

import { fetchGame, move, join, setUsername } from './actions';
import { setGameIndex, setMoveIndex, flipBoard } from './actions/gameUI';

import { currentPositionsSelector } from './selectors';

const Container = styled.div`
  margin: auto;
`;

const Boards = styled.div`
  display: flex;
  margin: auto;
`;

export class GamePage extends Component {
  static defaultProps = {
    timers: [],
    gameUI: []
  }

  componentDidMount() {
    const gameId = this._getGameId();

    // Populate redux game state from api
    this.props.onFetchGame(gameId);

    // Initialize socket connection
    this.socket = startGameConnection(gameId, this.props.dispatch);
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    // TODO: Have this depend on fetch actions
    if (!this.props.currentGames) {
      return <Container>Loading...</Container>;
    }

    if (!this.props.currentPositions) {
      return <Container>Error</Container>;
    }

    const boardNum = this._getFirstBoard();
    const opposingBoardNum = getOpposingBoardNum(boardNum);

    return (
      <Container>
        <Boards>
          {this._renderChessGame(boardNum)}
          <div className="PartnerGame">
            {this._renderChessGame(opposingBoardNum)}
          </div>
        </Boards>
        <HistoryScrubber
          onFirstMove={this.handleGameFirstMove}
          onPrevMove={this.handleGamePrevMove}
          onNextMove={this.handleGameNextMove}
          onLastMove={this.handleGameLastMove} />
        <PieceDragLayer />
        {this._renderPlayerSelectionDialog()}
      </Container>
    );
  }

  _getFirstBoard() {
    // TODO: Selector
    const { currentGames, username } = this.props;

    // Return the first board that matches the current username
    let firstBoard = currentGames.findIndex(game =>
      _.get(game.wPlayer, 'username') === username || _.get(game.bPlayer, 'username') === username
    );
    if (firstBoard === -1) {
      firstBoard = 0;
    }
    return firstBoard;
  }

  _renderChessGame(boardNum) {
    const { currentPositions, currentGames, winner, gameUI, username, timers } = this.props;

    return (
      <ChessGame
        boardNum={boardNum}
        {...currentGames[boardNum]}
        {...currentPositions[boardNum]}
        counters={timers[boardNum]}
        isFlipped={_.get(gameUI[boardNum], 'isFlipped')}
        onFlip={() => this.props.onFlip(boardNum)}
        isGameOver={!!winner}
        winner={winner}
        username={username}
        onFirstMove={this.handleGameFirstMove}
        onPrevMove={() => this.props.onSetMoveIndex(boardNum, 'PREV')}
        onNextMove={() => this.props.onSetMoveIndex(boardNum, 'NEXT')}
        onLastMove={this.handleGameLastMove}
        onSelectMove={(index) => this.props.onSetMoveIndex(boardNum, index)} />
    );
  }

  handleGameFirstMove = () => {
    this.props.onSetGameIndex('FIRST');
  }

  handleGamePrevMove = () => {
    this.props.onSetGameIndex('PREV');
  }

  handleGameNextMove = () => {
    this.props.onSetGameIndex('NEXT');
  }

  handleGameLastMove = () => {
    this.props.onSetGameIndex('LAST');
  }

  _renderPlayerSelectionDialog() {
    const { currentGames, username, connections } = this.props;

    if (!currentGames) {
      return;
    }

    // TODO: selector
    const allConnected = _.get(connections, 'length') === 2 &&
      _.every(connections, board => board.w && board.b);

    // TODO: If user temporarily leaves page, this will flash. Fix this with started flag
    const started = false;
    if (!allConnected && !started) {
      return (
        <PlayerSelectionDialog
          connections={connections}
          wPlayer0={currentGames[0].wPlayer}
          bPlayer0={currentGames[0].bPlayer}
          wPlayer1={currentGames[1].wPlayer}
          bPlayer1={currentGames[1].bPlayer}
          username={username}
          onSetUsername={this.props.onSetUsername}
          onSelectPlayer={this.props.onSelectPlayer}
          onDeselectPlayer={this.props.onDeselectPlayer} />
      );
    }
  }

  _getGameId() {
    return this.props.match.params.gameId;
  }
}

const mapStateToProps = state => ({
  ..._.pick(state.game, 'connections', 'timers', 'username', 'winner', 'currentGames'),
  gameUI: state.gameUI,
  currentPositions: currentPositionsSelector(state)
});

const mapDispatchToProps = dispatch => {
  return {
    onFetchGame: gameId => {
      dispatch(fetchGame(gameId));
    },
    onSetUsername: (username) => {
      dispatch(setUsername(username));
    },
    onSelectPlayer: ({ color, boardNum, username }) => {
      dispatch(join(color, boardNum, username, true));
    },
    onDeselectPlayer: ({ color, boardNum }) => {
      dispatch(join(color, boardNum, null, false));
    },
    onFlip: (boardNum) => {
      dispatch(flipBoard(boardNum));
    },
    onSetGameIndex: selection => {
      dispatch(setGameIndex(selection));
    },
    onSetMoveIndex: (boardNum, selection) => {
      dispatch(setMoveIndex(boardNum, selection));
    },
    onMove: (boardNum, data) => {
      dispatch(move(boardNum, data));
    },
    dispatch
  };
}

export const ConnectedGamePage = connect(
  mapStateToProps,
  mapDispatchToProps
)(GamePage);

export default withRouter(DragDropContext(HTML5Backend)(ConnectedGamePage));
