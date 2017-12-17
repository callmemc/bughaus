import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Client from './Client';
import { generateGameId } from './utils';

class HomePage extends Component {
  render() {
    return (
      <div className="App">
        <p>Home Page</p>
        <button onClick={this.createGame}>Create Game</button>
      </div>
    );
  }

  createGame = () => {
    const gameId = generateGameId();
    Client.createGame(gameId);
    this.props.history.push(`/game/${gameId}`)
  }
}

export default withRouter(HomePage);