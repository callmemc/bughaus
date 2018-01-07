import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';

class GamePage extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    // Initialize socket connection when component mounts
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);
    this.socket.on('update', this.update);
  }

  render() {
    return (
      <div className="GamePage">
        {this._renderChessGame()}
      </div>
    );
  }

  update = (data) => {
    this.setState({game1: data})
  }

  handleMove = (data) => {
    this.socket.emit('move', data);
  }

  _renderChessGame(flipped) {
    return (
      <ChessGame
        {...this.state.game1}
        onMove={this.handleMove}
        flipped={flipped} />
    );
  }
}

export default withRouter(GamePage);