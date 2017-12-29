import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import chessjs from '../chess.js';
import socketClient from '../socketClient';
import Chessboard from './Chessboard';
import PieceDragLayer from './PieceDragLayer';
import _ from 'lodash';

class ChessGame extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();
  }

  componentWillMount() {
    // Initialize socket connection when component mounts
    // TODO: Is this RIGHT?
    const gameId = this.props.match.params.gameId;
    this.socket = socketClient.initialize(gameId);

    this.socket.on('update', this.update);
  }

  render() {
    if (!_.get(this.state, 'board')) {
      return <div />;
    }

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
    this.chess.move({ from, to});
    this._updateBoard();
    this.socket.emit('move', this.chess.fen());
  }

  update = (fen) => {
    this.chess = new chessjs.Chess(fen);
    this._updateBoard();
  }

  _updateBoard() {
    this.setState({ board: this.chess.board() });
  }
}

export default withRouter(DragDropContext(HTML5Backend)(ChessGame));