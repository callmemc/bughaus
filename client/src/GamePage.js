import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import styled from 'styled-components';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import PlayerSelectionDialog from './components/PlayerSelectionDialog';
import {
  getOpposingBoardNum,
  getOpposingColor,
  removeFromReserve
} from './utils';
import * as sounds from './sounds';

const Container = styled.div`
  margin: auto;
  display: flex;
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
      isFlipped1: true
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

      this.updateGameListener({
        ...result,
        isFlipped0: flipBoard0,
        isFlipped1: !flipBoard0
      });
    })
    .then(() => {
      // TODO: Figure out why this needs to be in callback
      // Initialize socket connection when component mounts
      this.socket = socketClient.initialize(gameId);
      this.socket.on('updateGame', this.updateGameListener);
      this.socket.on('startGame', this.startGameListener);
      this.socket.on('timer', this.timerListener);
      this.socket.on('updateGameFromMove', this.updateFromMoveListener);
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
        <PieceDragLayer />
        {this._renderPlayerSelectionDialog()}
      </Container>
    );
  }

  timerListener = (data) => {
    this.setState(data);
  }

  updateGameListener = (data) => {
    // TODO: Think about restructuring this so not blindly writing all params to state
    this.setState(data);
  }

  startGameListener = (data) => {
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

  updateFromMoveListener = ({ game, isCapture }) => {
    this.setState(game);

    this._playMoveSound({ isCapture });
  }

  handleMove = (boardNum, data) => {
    const { fen, promotedSquares, history,
      capturedPiece, droppedPieceIndex, moveColor, isCheckmate } = data;
    const newState = {
      [`fen${boardNum}`]: fen,
      [`promotedSquares${boardNum}`]: promotedSquares,
      [`history${boardNum}`]: history
    };

    if (capturedPiece) {
      // Add piece to partner's reserve
      const capturedColor = getOpposingColor(moveColor);
      const otherBoardNum = getOpposingBoardNum(boardNum);
      const reserveKey = `${capturedColor}Reserve${otherBoardNum}`;
      newState[reserveKey] = this.state[reserveKey] + capturedPiece;
    } else if (droppedPieceIndex !== undefined) {
      // Remove piece from player's reserve
      const reserveKey = `${moveColor}Reserve${boardNum}`;
      newState[reserveKey] = removeFromReserve(this.state[reserveKey], droppedPieceIndex);
    }

    this._playMoveSound({ isCapture: !!capturedPiece });

    // Note: Winner is stored, rather than calculated from fen, b/c players can lose for
    //  other reasons (e.g. time running out)
    if (isCheckmate) {
      newState.winner = { color: moveColor, boardNum };
    }

    this.setState(newState);
    this.socket.emit('move', {
      game: newState,
      boardNum,
      nextColor: getOpposingColor(moveColor),
      isCapture: !!capturedPiece
    });
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

  _renderChessGame(boardNum) {
    return (
      <ChessGame
        boardNum={boardNum}
        counters={this.state[`counters${boardNum}`]}
        wPlayer={this.state[`wPlayer${boardNum}`]}
        bPlayer={this.state[`bPlayer${boardNum}`]}
        fen={this.state[`fen${boardNum}`]}
        history={this.state[`history${boardNum}`]}
        wReserve={this.state[`wReserve${boardNum}`]}
        bReserve={this.state[`bReserve${boardNum}`]}
        promotedSquares={this.state[`promotedSquares${boardNum}`] || {}}
        isFlipped={this.state[`isFlipped${boardNum}`]}
        onFlip={() => this.handleFlip(boardNum)}
        onMove={data => this.handleMove(boardNum, data)}
        isGameOver={!!this.state.winner}
        winner={this.state.winner}
        username={this.state.username} />
    );
  }

  _renderPlayerSelectionDialog() {
    const { wPlayer0, bPlayer0, wPlayer1, bPlayer1, username } = this.state;

    const userKeys = ['wPlayer0', 'wPlayer1', 'bPlayer0', 'bPlayer1'];
    const isConnected = _.every(userKeys, key => {
      return _.get(this.state[key], 'status') === 'CONNECTED';
    });

    // TODO: If user temporarily leaves page, this will flash
    //  Fix this with started flag
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
}

export default withRouter(DragDropContext(HTML5Backend)(GamePage));
