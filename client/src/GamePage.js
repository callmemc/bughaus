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

      // TODO: Use a shared method
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

  updateGameListener = (game) => {
    // TODO: Think about restructuring this so not blindly writing all params to state
    this.setState({
      ...game,
      ...game.history0 && { history0: Immutable(game.history0) },
      ...game.history1 && { history1: Immutable(game.history1) }
    });
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
    this.setState({
      ...game,
      ...game.history0 && { history0: Immutable(game.history0) },
      ...game.history1 && { history1: Immutable(game.history1) }
    });

    this._playMoveSound({ isCapture });
  }

  handleMove = (boardNum, data) => {
    const { promotedSquares, capturedPiece, moveColor, isCheckmate } = data;
    const piecePositions = this._getUpdatedPiecePositions(boardNum, data);
    const otherBoardNum = getOpposingBoardNum(boardNum);

    const newState = {
      [`promotedSquares${boardNum}`]: promotedSquares,
      // Add move to this board's history
      [`history${boardNum}`]: this._getUpdatedHistory(boardNum, data, piecePositions),
      // Add piece to partner's reserve in last move
      ...capturedPiece &&
        { [`history${otherBoardNum}`]: this._getCapturedHistory(otherBoardNum, data) }
    };

    // Play sound
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

  _getUpdatedPiecePositions(boardNum, { move, droppedPiece, capturedPiece, moveColor }) {
    const history = this.state[`history${boardNum}`];
    let piecePositions = _.last(history).piecePositions;

    // Update taken piece
    // Note: Keeping null piecePositions so element positions don't get moved... this is ugly
    if (capturedPiece) {
      const takenPieceIndex = piecePositions.findIndex(piece => piece && piece.square === move.to);
      piecePositions = Immutable.set(piecePositions, takenPieceIndex, null);
    }

    // Update moved piece
    if (move.from) {
      const pieceIndex = piecePositions.findIndex(piece => piece && piece.square === move.from);
      piecePositions = Immutable.setIn(piecePositions, [pieceIndex, 'square'], move.to);
    // Update dropped piece
    } else {
      piecePositions = piecePositions.concat({
        key: `drop_${history.length}`,    // key must be unique
        square: move.to,
        piece: droppedPiece,
        color: moveColor
      });
    }

    return piecePositions;
  }

  // Update other board's history by adding captured piece to last move's reserve
  _getCapturedHistory(otherBoardNum, { moveColor, capturedPiece }) {
    const capturedColor = getOpposingColor(moveColor);
    const oldHistory = this.state[`history${otherBoardNum}`];
    return Immutable.updateIn(oldHistory,
      [ oldHistory.length - 1,`${capturedColor}Reserve`],
      (reserve) => reserve + capturedPiece);
  }

  _getUpdatedHistory(boardNum, { move, moveColor, droppedPiece, droppedPieceIndex, fen }, piecePositions) {
    const opposingColor = getOpposingColor(moveColor);
    const lastMove = _.last(this.state[`history${boardNum}`]);

    let currentReserve = lastMove[`${moveColor}Reserve`];
    if (droppedPieceIndex !== undefined) {
      currentReserve = removeFromReserve(currentReserve, droppedPieceIndex);
    }

    const history = this.state[`history${boardNum}`] || [];
    let historyMove = {
      ...move,
      [`${moveColor}Reserve`]: currentReserve,
      [`${opposingColor}Reserve`]: lastMove[`${opposingColor}Reserve`],
      fen,
      piecePositions,
      piece: droppedPiece
    };

    return history.concat(historyMove);
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
        history={this.state[`history${boardNum}`]}
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
