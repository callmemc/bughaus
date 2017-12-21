import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import chessjs from '../chess.js';
import Chessboard from './Chessboard';

class ChessGame extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      board: this.chess.board()
    };
  }

  render() {
    return (
      <div className="ChessGame">
        <Chessboard board={this.state.board} />
      </div>
    );
  }
}

export default DragDropContext(HTML5Backend)(ChessGame);