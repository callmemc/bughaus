import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';
import { getWinningTeam } from './utils';

class GamePage extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    // Initialize socket connection when component mounts
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);
    this.socket.on('updateGame', this.updateGameListener);
  }

  render() {
    return (
      <div className="GamePage">
        <div className="Boards">
          {this._renderChessGame(0)}
          <div className="PartnerGame">
            {this._renderChessGame(1)}
          </div>
        </div>
        <GameStatus winner={this.state.winner} />
        <PieceDragLayer />
      </div>
    );
  }

  updateGameListener = (data) => {
    this.setState(data);
  }

  handleMove = (boardNum, data) => {
    const {fen, capturedPiece, droppedPiece, moveColor, isCheckmate} = data;
    const newState = {
      [`fen${boardNum}`]: fen
    };

    if (capturedPiece) {
      // Add piece to partner's reserve
      const capturedColor = moveColor === 'w' ? 'b' : 'w';
      const otherBoardNum = boardNum === 0 ? 1 : 0;
      const reserveKey = `${capturedColor}Reserve${otherBoardNum}`;
      newState[reserveKey] = this.state[reserveKey] + capturedPiece;
    } else if (droppedPiece) {
      // Remove piece from player's reserve
      const reserveKey = `${moveColor}Reserve${boardNum}`;
      newState[reserveKey] = this.state[reserveKey].replace(new RegExp(droppedPiece), '');
    }

    // Note: Winner is stored, rather than calculated from fen, b/c players can lose for
    //  other reasons (e.g. time running out)
    if (isCheckmate) {
      newState.winner = { color: moveColor, boardNum };
    }

    this.setState(newState);

    this.socket.emit('move', newState);
  }

  _renderChessGame(boardNum) {
    const flipped = boardNum === 0 ? false : true;
    return (
      <ChessGame
        fen={this.state[`fen${boardNum}`]}
        wReserve={this.state[`wReserve${boardNum}`]}
        bReserve={this.state[`bReserve${boardNum}`]}
        onMove={data => this.handleMove(boardNum, data)}
        isGameOver={this.state.winner}
        flipped={flipped} />
    );
  }
}

class GameStatus extends Component {
  static propTypes = {
    winner: PropTypes.object
  }

  render() {
    const { winner } = this.props;
    if (!this.props.winner) {
      return <div />;
    } else {
      return (
        <div className="GameStatus">
          Winner: Team {getWinningTeam(winner)}!
        </div>
      )
    }
  }
}

export default withRouter(DragDropContext(HTML5Backend)(GamePage));
