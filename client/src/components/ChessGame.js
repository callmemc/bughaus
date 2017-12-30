import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import chessjs from '../chess.js';
import socketClient from '../socketClient';
import Chessboard from './Chessboard';
import PieceDragLayer from './PieceDragLayer';
import Sidebar from './Sidebar';
import Reserve from './Reserve';

class ChessGame extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      wReserve: [],
      bReserve: [],
    };
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
        <Reserve color="w" queue={this.state.bReserve} />
        <div className="ChessGame__play">
          <Chessboard board={this.state.board}
            makeMove={this.makeMove} />
          <Sidebar turn={this.state.turn} />
        </div>
        <Reserve color="b" queue={this.state.wReserve} />
        <PieceDragLayer />
      </div>
    );
  }

  makeMove = ({from, to}) => {
    const moveResult = this.chess.move({ from, to});

    // chess.move() returns null if move was invalid
    if (moveResult) {
      const { captured, color } = moveResult;

      if (captured) {
        this._updateReserve(captured, color);
      }

      this._updateBoard();
      this.socket.emit('move', {
        fen: this.chess.fen(),
        wReserve: this.state.wReserve,
        bReserve: this.state.bReserve
      });
    }
  }

  update = (data) => {
    this.chess = new chessjs.Chess(data.fen);
    this._updateBoard();
    this.setState({ wReserve: data.wReserve });
    this.setState({ bReserve: data.bReserve });
  }

  _updateBoard() {
    this.setState({
      board: this.chess.board(),
      turn: this.chess.turn()
    });
  }

  _updateReserve(capturedPiece, color) {
    const reserveName = color === 'w' ? 'wReserve' : 'bReserve';
    this.setState({ [reserveName]: [...this.state[reserveName], capturedPiece] });
  }
}

export default withRouter(DragDropContext(HTML5Backend)(ChessGame));