import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import socketClient from './socketClient';
import chessjs from './chess.js';
import Chessboard from './components/Chessboard';

class GamePage extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      board: this.chess.board()
    };
  }

  componentWillMount() {
    // Initialize socket connection when component mounts
    // TODO: Is this RIGHT?
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);
  }

  render() {
    return (
      <div className="GamePage">
        <h1>Game Page</h1>
        <div className="ChessGame">
          <Chessboard board={this.state.board} />
        </div>
        <button onClick={this.makeMove}>Make Move</button>
      </div>
    );
  }

  makeMove = () => {
    // TODO: abstract?
    // TODO: recalculate board object... which is only updated when move is made
    this.socket.emit('move', 'position');
  }
}

export default withRouter(GamePage);