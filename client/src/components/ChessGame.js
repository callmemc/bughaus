import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import chessjs from '../chess.js';
import socketClient from '../socketClient';
import Chessboard from './Chessboard';
import PieceDragLayer from './PieceDragLayer';
import PromotionDialog from './PromotionDialog';
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
        <Reserve
          color="w"
          isGameOver={this.state.isGameOver}
          queue={this.state.bReserve} />
        <div className="ChessGame__play">
          <Chessboard
            activeSquare={this.state.activeSquare}
            moves={this.state.moves}
            board={this.state.board}
            isGameOver={this.state.isGameOver}
            onDropPiece={this.onDropPiece}
            onDragEnd={this.onDragEnd}
            onSelect={this.onSelect}
            turn={this.state.turn} />
          <Sidebar
            isGameOver={this.state.isGameOver}
            turn={this.state.turn} />
        </div>
        <Reserve
          color="b"
          isGameOver={this.state.isGameOver}
          queue={this.state.wReserve} />
        <PieceDragLayer />
        {this._renderPromotionDialog()}
      </div>
    );
  }

  onDropPiece = ({from, to}) => {
    if (!this.state.moves) {
      return;
    }

    const promotionMoves = this.state.moves.filter(move =>
      move.from === from && move.to === to && move.promotion);

    // Promotion
    if (promotionMoves.length > 0) {
      this.setState({
        activePromotion: {
          from,
          to,
          pieces: promotionMoves.map(move => move.promotion)
        }
      });
      return;
    }

    const moveResult = this.chess.move({ from, to });
    this._makeMove(moveResult);

  }

  onSelectPromotion = (promotionPiece) => {
    const { from, to } = this.state.activePromotion;
    const moveResult = this.chess.move({ from, to, promotion: promotionPiece });
    this.setState({ activePromotion: undefined });
    this._makeMove(moveResult);
  }

  _makeMove(moveResult) {
    // chess.move() returns null if move was invalid
    if (!moveResult) {
      return;
    }

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

  onDragEnd = (square) => {
    this.setState({
      activeSquare: undefined,
      moves: undefined
    });
  }

  onSelect = (square) => {
    // if (this.state.activeSquare === square) {
    //   this.setState({
    //     activeSquare: undefined,
    //     moves: undefined
    //   });
    // } else {
      this.setState({
        activeSquare: square,
        moves: this.chess.moves({ verbose: true, square })
      });
    // }
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
      isGameOver: this.chess.in_checkmate(), // turn is in checkmate
      turn: this.chess.turn()
    });
  }

  _updateReserve(capturedPiece, color) {
    const reserveName = color === 'w' ? 'wReserve' : 'bReserve';
    this.setState({ [reserveName]: [...this.state[reserveName], capturedPiece] });
  }

  _renderPromotionDialog() {
    if (this.state.activePromotion) {
      return (
        <PromotionDialog
          color={this.state.turn}
          onSelectPromotion={this.onSelectPromotion}
          pieces={this.state.activePromotion.pieces} />
      );
    }
  }
}

export default withRouter(DragDropContext(HTML5Backend)(ChessGame));