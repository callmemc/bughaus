import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import socketClient from './socketClient';
import ChessGame from './components/ChessGame';
import PieceDragLayer from './components/PieceDragLayer';

class GamePage extends Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    // Initialize socket connection when component mounts
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);
    this.socket.on('updateBoard', this.updateBoardListener);

    // TODO: Remove this in favor of api call
    this.socket.on('updateGame', this.updateGameListener);
  }

  render() {
    return (
      <div className="GamePage">
        {this._renderChessGame(0)}
        <div className="PartnerGame">
          {this._renderChessGame(1)}
        </div>
        <PieceDragLayer />
      </div>
    );
  }

  updateBoardListener = ({boardNum, board}) => {
    this.setState({ [`board${boardNum}`]: board });
  }

  updateGameListener = (data) => {
    this.setState({
      board0: data[0],
      board1: data[1]
    });
  }

  handleMove = (boardNum, data) => {
    this.socket.emit('move', { boardNum, board: data } );
  }

  _renderChessGame(boardNum) {
    const flipped = boardNum === 0 ? false : true;
    return (
      <ChessGame
        {...this.state[`board${boardNum}`]}
        onMove={data => this.handleMove(boardNum, data)}
        flipped={flipped} />
    );
  }
}

export default withRouter(DragDropContext(HTML5Backend)(GamePage));
