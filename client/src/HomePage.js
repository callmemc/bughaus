import React, { Component } from 'react';
import Client from './Client';

class HomePage extends Component {
  render() {
    return (
      <div className="App">
        <p>Home Page</p>
        <button onClick={Client.createGame}>Create Game</button>
      </div>
    );
  }

  createGame() {
  	console.log('hit server');
  }
}

export default HomePage;