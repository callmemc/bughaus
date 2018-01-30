import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import PlayerSelectionDialog from './components/PlayerSelectionDialog';
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
    .then((result) => {
      const { username, bUserId0, wUserId1, wUserId0 } = result;
      // TODO: util
      const flipBoard0 = (username === bUserId0 || username === wUserId1) &&
        username !== wUserId0;

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
    });
  }

  render() {
    // TODO: Util. Also think about this... Consider ability to swap boards?
    // If multiple users, Board 0 takes precedence, and white takes precedence
    const { username, wUserId0, wUserId1, bUserId0, bUserId1 } = this.state;
    const isBoard0 = username === wUserId0 || username === bUserId0;
    const isBoard1 = username === wUserId1 || username === bUserId1;
    const boardNum = isBoard0 ? 0 : (isBoard1 ? 1 : 0);
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
        {this._renderPlayerSelectionDialog()}
      </div>
    );
  }

  updateGameListener = (data) => {
    // TODO: Think about restructuring this so not blindly writing all params to state
    this.setState(data);
  }

  startGameListener = (data) => {
    const { bUserId0, wUserId1, wUserId0 } = data;
    const { username } = this.state;

    // TODO: util
    const flipBoard0 = (username === bUserId0 || username === wUserId1) &&
      username !== wUserId0;

    this.setState({
      isFlipped0: flipBoard0,
      isFlipped1: !flipBoard0
    });
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

  handleCreateUsername = (username) => {
    this.socket.emit('createUsername', {
      gameId: this._getGameId(),
      username
    });

    // TODO: Need to be more explicit about how username is passed from server to state
    this.setState({ username });
  }

  handleSelectPlayer = ({ color, boardNum, username }) => {
    const userKey = `${color}UserId${boardNum}`;

    // TODO: Allow changing of username by using the session id, rather than username,
    //  for the player user id
    this.setState({
      [userKey]: username
    });

    const gameId = this._getGameId();
    this.socket.emit('join', { gameId, userKey, username });
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
          isGameOver={!!this.state.winner}
          username={this.state.username} />
        <div>Board {boardNum}</div>
      </div>
    );
  }

  _renderPlayerSelectionDialog() {
    const { wUserId0, bUserId0, wUserId1, bUserId1, username } = this.state;

    if (wUserId0 && bUserId0 && wUserId1 && bUserId1) {
      return null;
    }

    return (
      <PlayerSelectionDialog
        wUserId0={wUserId0}
        bUserId0={bUserId0}
        wUserId1={wUserId1}
        bUserId1={bUserId1}
        username={username}
        onCreateUsername={this.handleCreateUsername}
        onSelectPlayer={this.handleSelectPlayer} />
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
