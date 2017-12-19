import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import socketClient from './socketClient';
import chessjs from './chess.js';
import Chessboard from './components/Chessboard';

let socket;

class GamePage extends Component {
  componentWillMount() {
    // Initialize socket connection when component mounts
    // TODO: Is this RIGHT?
    const gameId = this.props.match.params.gameId;
    socket = socketClient.initialize(gameId);
  }

  render() {
    const fen = new chessjs.Chess().fen();

    return (
      <div className="App">
        <h1>Game Page</h1>
        <Chessboard fen={fen} />
        <button onClick={this.makeMove}>Make Move</button>
      </div>
    );
  }

  makeMove = () => {
    // TODO: abstract?
    socket.emit('move', 'position');
  }
}

export default withRouter(GamePage);