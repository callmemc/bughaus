import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import socketClient from './socketClient';
import ChessGame from './components/ChessGame';

class GamePage extends Component {

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
        <ChessGame />
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