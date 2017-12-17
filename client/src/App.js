import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import GamePage from './GamePage';

class PrimaryLayout extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome to Bughaus</h1>
        </header>
        <main>
          <Route path ="/" exact component={HomePage}/>
          <Route path ="/game/:gameId" exact component={GamePage}/>
        </main>
      </div>
    );
  }
}

const App = () => (
  <BrowserRouter>
    <PrimaryLayout />
  </BrowserRouter>
);

export default App;
