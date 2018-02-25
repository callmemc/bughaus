import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styled from 'styled-components';
import Immutable from 'seamless-immutable';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import PlayerSelectionDialog from './components/PlayerSelectionDialog';
import HistoryScrubber from './components/HistoryScrubber';
import { getOpposingBoardNum, getOpposingColor } from './utils';
import { getNewPosition, getReserve } from './utils/positionUtils';
import * as sounds from './sounds';

const Container = styled.div`
  margin: auto;
`;

const Boards = styled.div`
  display: flex;
  margin: auto;
`;

class GamePage extends Component {
  constructor() {
    super();

    this.state = {
      isFlipped0: false,
      isFlipped1: true,
      historyIndex: 0
    };
  }
  componentDidMount() {
    const gameId = this._getGameId();

    fetch(`/api/game/${gameId}`, {
      headers: {
        'Accept': 'application/json'
      },
      // Initial server request initiates the session middleware on server
      credentials: 'include'
    })
    .then((response) => response.json())
    .then((result) => {
      const { username, bPlayer0, wPlayer1, wPlayer0 } = result;
      // TODO: util
      const flipBoard0 = ( username === _.get(bPlayer0, 'username') ||
        username === _.get(wPlayer1, 'username')) &&
          username !== _.get(wPlayer0, 'username');

      // TODO: Use a shared method
      this.fetchGame({
        ...result,
        isFlipped0: flipBoard0,
        isFlipped1: !flipBoard0
      });
    })
    .then(() => {
      // TODO: Figure out why this needs to be in callback
      // Initialize socket connection when component mounts
      this.socket = socketClient.initialize(gameId);
      this.socket.on('updateGame', this.updateGame);
      this.socket.on('startGame', this.startGame);
      this.socket.on('timer', this.updateTimer);
      this.socket.on('updateGameFromMove', this.updateGameFromMove);
    });
  }

  render() {
    // TODO: Util. Also think about this... Consider ability to swap boards?
    // If multiple users, Board 0 takes precedence, and white takes precedence
    const { username, wPlayer0, wPlayer1, bPlayer0, bPlayer1 } = this.state;
    const isBoard0 = username === wPlayer0 || username === bPlayer0;
    const isBoard1 = username === wPlayer1 || username === bPlayer1;
    const boardNum = isBoard0 ? 0 : (isBoard1 ? 1 : 0);
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

  _renderChessGame(boardNum) {
    const { historyIndex, history } = this.state;
    if (!history) {
      return;
    }

    const slicedHistory = history.slice(0, historyIndex + 1);
    const boardPosition = _.findLast(slicedHistory, position =>
      position.boardNum === boardNum);
    if (!boardPosition) {
      return console.error('No board found');
    }

    const otherBoardPosition = _.findLast(slicedHistory, position =>
      position.boardNum === getOpposingBoardNum(boardNum));
    if (!otherBoardPosition) {
      return console.error('No otherboard found');
    }

    const { board, fen, wDropped, bDropped, moveIndex } = boardPosition;
    const { wCaptured, bCaptured } = otherBoardPosition;

    return (
      <ChessGame
        boardNum={boardNum}
        fen={fen}
        moves={this.state[`moves${boardNum}`]}
        board={board}
        wReserve={getReserve(wCaptured, wDropped)}
        bReserve={getReserve(bCaptured, bDropped)}
        moveIndex={moveIndex}
        counters={this.state[`counters${boardNum}`]}
        wPlayer={this.state[`wPlayer${boardNum}`]}
        bPlayer={this.state[`bPlayer${boardNum}`]}
        isFlipped={this.state[`isFlipped${boardNum}`]}
        onFlip={() => this.handleFlip(boardNum)}
        onMove={data => this.handleMove(boardNum, data)}
        isGameOver={!!this.state.winner}
        winner={this.state.winner}
        username={this.state.username}
        onFirstMove={() => this.handleFirstMove(boardNum)}
        onPrevMove={() => this.handlePrevMove(boardNum)}
        onNextMove={() => this.handleNextMove(boardNum)}
        onLastMove={() => this.handleLastMove(boardNum)}
        onSelectMove={(index) => this.handleSelectMove(boardNum, index)} />
    );
  }

  // moves0, moves1, isFlipped0, isFlipped1, wPlayer0, wPlayer1, bPlayer0, bPlayer1, username
  fetchGame = (result) => {
    this.setState({
      ...result,
      ...result.history && {
        historyIndex: result.history.length - 1,
        history: Immutable(result.history)
      }
    });
  }

  handleMove = (boardNum, data) => {
    const { capturedPiece, moveColor, isCheckmate, move } = data;
    const { history, historyIndex } = this.state;
    const newPosition = getNewPosition(data, boardNum, history);
    const newMoves = this.state[`moves${boardNum}`].concat(move);

    let winner;
    if (isCheckmate) {
      winner = { color: moveColor, boardNum };
    }

    this.setState({
      history: history.concat(newPosition),
      [`moves${boardNum}`]: newMoves,
      ...historyIndex === history.length - 1 && {
        historyIndex: history.length
      },
      // Note: Winner is manually set, rather than calculated from fen, b/c players can also lose from timeout
      ...isCheckmate && { winner }
    });

    this.socket.emit('move', {
      game: {
        [`moves${boardNum}`]: newMoves,
        ...isCheckmate && { winner }
      },
      newPosition,
      boardNum,
      nextColor: getOpposingColor(moveColor),
      isCapture: !!capturedPiece
    });

    this._playMoveSound({ isCapture: !!capturedPiece });
  }

  updateGameFromMove = ({ game, newPosition, isCapture }) => {
    const { history, historyIndex } = this.state;

    this.setState({
      ...game,
      history: history.concat(newPosition),
      ...historyIndex === history.length - 1 && {
        historyIndex: history.length
      },
    });

    this._playMoveSound({ isCapture });
  }

  handleSetUsername = (username) => {
    this.socket.emit('setUsername', {
      gameId: this._getGameId(),
      username
    });

    // TODO: Need to be more explicit about how username is passed from server to state
    this.setState({ username });
  }

  handleSelectPlayer = ({ color, boardNum, username }) => {
    const userKey = `${color}Player${boardNum}`;

    const gameId = this._getGameId();
    this.socket.emit('selectPlayer', { gameId, userKey, username });
  }

  handleDeselectPlayer = ({ color, boardNum }) => {
    const userKey = `${color}Player${boardNum}`;

    const gameId = this._getGameId();
    this.socket.emit('deselectPlayer', { gameId, userKey });
  }

  handleFlip = (boardNum) => {
    const key = `isFlipped${boardNum}`;
    this.setState({
      [key]: !this.state[key]
    });
  }

  handleGameFirstMove = () => {
    this._setGameIndex(1);
  }

  handleGamePrevMove = () => {
    this._setGameIndex(this.state.historyIndex - 1);
  }

  handleGameNextMove = () => {
    this._setGameIndex(this.state.historyIndex + 1);
  }

  handleGameLastMove = () => {
    this._setGameIndex(this.state.history.length - 1);
  }

  _setGameIndex(newIndex) {
    const position = this.state.history[newIndex];
    if (!position) {
      return console.error('No move found');
    }
    if (newIndex < 1) {
      return console.log('Reached beginning');
    }
    this.setState({ historyIndex: newIndex });
  }

  handleSelectMove = (boardNum, moveIndex) => {
    this._setMoveIndex(boardNum, moveIndex);
  }

  handleFirstMove = (boardNum) => {
    this.handleGameFirstMove();
  }

  handlePrevMove = (boardNum) => {
    this._shiftMoveIndex(boardNum, - 1);
  }

  handleNextMove = (boardNum) => {
    this._shiftMoveIndex(boardNum, 1);
  }

  handleLastMove = (boardNum) => {
    this.handleGameLastMove();
  }

  _shiftMoveIndex(boardNum, direction) {
    const { history, historyIndex } = this.state;
    let lastBoardPosition;
    if (history[historyIndex].boardNum === boardNum) {
      lastBoardPosition = history[historyIndex];
    } else {
      lastBoardPosition = _.findLast(history.slice(0, historyIndex), position =>
        position.boardNum === boardNum);
    }
    const newMoveIndex = lastBoardPosition.moveIndex + direction;

    this._setMoveIndex(boardNum, newMoveIndex);
  }

  _setMoveIndex(boardNum, newMoveIndex) {
    const { history } = this.state;
    const historyIndex = history.findIndex(position =>
      position.boardNum === boardNum && position.moveIndex === newMoveIndex
    );

    this._setGameIndex(historyIndex);
  }

  _renderPlayerSelectionDialog() {
    const { wPlayer0, bPlayer0, wPlayer1, bPlayer1, username } = this.state;

    const userKeys = ['wPlayer0', 'wPlayer1', 'bPlayer0', 'bPlayer1'];
    const isConnected = _.every(userKeys, key => {
      return _.get(this.state[key], 'status') === 'CONNECTED';
    });

    // TODO: If user temporarily leaves page, this will flash. Fix this with started flag
    const started = false;

    if (!isConnected && !started) {
      return (
        <PlayerSelectionDialog
          wPlayer0={wPlayer0}
          bPlayer0={bPlayer0}
          wPlayer1={wPlayer1}
          bPlayer1={bPlayer1}
          username={username}
          onSetUsername={this.handleSetUsername}
          onSelectPlayer={this.handleSelectPlayer}
          onDeselectPlayer={this.handleDeselectPlayer} />
      );
    }
  }

  _playMoveSound({ isCapture }) {
    if (isCapture) {
      sounds.playCaptureSound();
    } else {
      sounds.playMoveSound();
    }
  }

  _getGameId() {
    return this.props.match.params.gameId;
  }

  updateTimer = ({ counters0, counters1 }) => {
    this.setState({ counters0, counters1 });
  }

  updateGame = (game) => {
    // TODO: Think about restructuring this so not blindly writing all params to state
    this.setState(game);
  }

  startGame = (data) => {
    const { bPlayer0, wPlayer1, wPlayer0 } = data;
    const { username } = this.state;

    // TODO: util
    const flipBoard0 = (username === bPlayer0 || username === wPlayer1) &&
      username !== wPlayer0;

    this.setState({
      isFlipped0: flipBoard0,
      isFlipped1: !flipBoard0
    });
  }
}

export default withRouter(DragDropContext(HTML5Backend)(GamePage));
