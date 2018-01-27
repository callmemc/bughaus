import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import UserSelectionDialog from './components/UserSelectionDialog';
import {
  getTeam,
  getOpposingBoardNum,
  getOpposingColor,
  removeFromReserve
} from './utils';

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
    .then(this.updateGameListener)
    .then(() => {
      // TODO: Figure out why this needs to be in callback
      // Initialize socket connection when component mounts
      this.socket = socketClient.initialize(gameId);
      this.socket.on('updateGame', this.updateGameListener);
    });
  }

  render() {
    const boardNum = _.get(this.state.currentSession, 'boardNum') || 0;
    const opposingBoardNum = getOpposingBoardNum(boardNum);

    return (
      <div className="GamePage">
        <div className="Boards">
          {this._renderChessGame(boardNum)}
          <div className="PartnerGame">
            {this._renderChessGame(opposingBoardNum)}
          </div>
        </div>
        <GameStatus winner={this.state.winner} />
        <PieceDragLayer />
        {this._renderUserSelectionDialog()}
      </div>
    );
  }

  updateGameListener = (data) => {
    this.setState(data);
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

    // Note: Winner is stored, rather than calculated from fen, b/c players can lose for
    //  other reasons (e.g. time running out)
    if (isCheckmate) {
      newState.winner = { color: moveColor, boardNum };
    }

    this.setState(newState);
    this.socket.emit('move', newState);
  }

  handleSelectUser = ({ color, boardNum, username }) => {
    const userKey = `${color}UserId${boardNum}`;
    const flipBoard0 = (color === 'b' && boardNum === 0) ||
      (color === 'w' && boardNum === 1);

    // TODO: Store current user in session. This is a TEMPORARY hack
    this.setState({
      [userKey]: username,
      currentSession: { color, boardNum, username },
      isFlipped0: flipBoard0,
      isFlipped1: !flipBoard0
    });

    const gameId = this._getGameId();
    this.socket.emit('join', { gameId, username, color, boardNum, userKey });
  }

  handleFlip = (boardNum) => {
    const key = `isFlipped${boardNum}`;
    this.setState({
      [key]: !this.state[key]
    });
  }

  _renderChessGame(boardNum) {
    return (
      <div>
        <ChessGame
          wUserId={this.state[`wUserId${boardNum}`]}
          bUserId={this.state[`bUserId${boardNum}`]}
          fen={this.state[`fen${boardNum}`]}
          history={this.state[`history${boardNum}`]}
          wReserve={this.state[`wReserve${boardNum}`]}
          bReserve={this.state[`bReserve${boardNum}`]}
          promotedSquares={this.state[`promotedSquares${boardNum}`] || {}}
          isFlipped={this.state[`isFlipped${boardNum}`]}
          onFlip={() => this.handleFlip(boardNum)}
          onMove={data => this.handleMove(boardNum, data)}
          isGameOver={!!this.state.winner} />
      </div>
    );
  }

  _renderUserSelectionDialog() {
    const { wUserId0, bUserId0, wUserId1, bUserId1 } = this.state;

    // TODO: and type is multiplayer
    if (wUserId0 && bUserId0 && wUserId1 && bUserId1) {
      return null;
    }

    return (
      <UserSelectionDialog
        currentSession={this.state.currentSession}
        wUserId0={wUserId0}
        bUserId0={bUserId0}
        wUserId1={wUserId1}
        bUserId1={bUserId1}
        onSelectUser={this.handleSelectUser} />
    );
  }

  _getGameId() {
    return this.props.match.params.gameId;
  }
}

class GameStatus extends Component {
  static propTypes = {
    winner: PropTypes.object
  }

  render() {
    const { winner } = this.props;
    if (!winner) {
      return <div />;
    } else {
      return (
        <div className="GameStatus">
          Winner: Team {getTeam(winner)}!
        </div>
      )
    }
  }
}

export default withRouter(DragDropContext(HTML5Backend)(GamePage));
