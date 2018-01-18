import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Client from './Client';
import { generateGameId } from './utils';
import FlatButton from 'material-ui/FlatButton';

class HomePage extends Component {
  render() {
    return (
      <div className="App">
        <h3>Create a Bughouse Game</h3>
        <p>Which type of game do you want to create?</p>
        <div className="GameButtons">
          <div className="GameButton">
            <FlatButton
              label="Simulated"
              backgroundColor="#a4c639"
              hoverColor="#8AA62F"
              labelStyle={{color: 'white'}}
              onClick={() => this.createGame('SIM')} />
          </div>
          <div className="GameButton">
            <FlatButton
              className="GameButton"
              label="Multiplayer"
              backgroundColor="#a4c639"
              hoverColor="#8AA62F"
              labelStyle={{color: 'white'}}
              onClick={() => this.createGame('MULTI')} />
          </div>
        </div>
      </div>
    );
  }

  createGame = (type) => {
    const gameId = generateGameId();

    if (type === 'MULTI') {
      // TODO
    }

    Client.createGame(gameId);
    this.props.history.push(`/game/${gameId}`)
  }
}

export default withRouter(HomePage);