import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import socketClient from './socketClient';

let socket;

class GamePage extends Component {  
  componentWillMount() {
    // Initialize socket connection when component mounts
    // TODO: Is this RIGHT?
    const gameId = this.props.match.params.gameId;
    socket = socketClient.initialize(gameId);
  }

  render() {
    return (
      <div className="App">
        <p>Game Page</p>
        <button onClick={this.makeMove}>Make Move</button>
      </div>
    );
  }

  makeMove = () => {
    // TODO: abstract?
    socket.emit('move', 'test data');
  }
}

export default withRouter(GamePage);