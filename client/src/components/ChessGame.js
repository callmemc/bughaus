import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import chessjs from '../chess.js';
import socketClient from '../socketClient';
import Chessboard from './Chessboard';
import PieceDragLayer from './PieceDragLayer';

class ChessGame extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      board: this.chess.board()
    };
  }

  componentWillMount() {
    // Initialize socket connection when component mounts
    // TODO: Is this RIGHT?
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);
  }

  render() {
    return (
      <div className="ChessGame">
        <Chessboard board={this.state.board}
          makeMove={this.makeMove} />
        <PieceDragLayer />
      </div>
    );
  }

  makeMove = ({from, to}) => {
    // TODO: abstract?
    // TODO: recalculate board object... which is only updated when move is made
    console.log(from, to);
    this.chess.move({ from, to});
    this.setState({ board: this.chess.board() });

    this.socket.emit('move', this.chess.fen()); // TODO
  }
}

export default withRouter(DragDropContext(HTML5Backend)(ChessGame));