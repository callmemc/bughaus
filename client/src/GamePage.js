import React, { Component } from 'react';
import ChessGame from './components/ChessGame';

class GamePage extends Component {
  render() {
    return (
      <div className="GamePage">
        <ChessGame />
      </div>
    );
  }
}

export default GamePage;