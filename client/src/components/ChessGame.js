import React, { Component } from 'react';
import _ from 'lodash';
import chessjs from '../chess.js';
import Chessboard from './Chessboard';
import PromotionDialog from './PromotionDialog';
import Sidebar from './Sidebar';
import Reserve from './Reserve';

class ChessGame extends Component {
  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      flipped: !!this.props.flipped,
      wReserve: '',
      bReserve: ''
    };
  }

  // Hold internal state for quick update
  componentWillReceiveProps (nextProps) {
    if (nextProps.fen !== this.state.fen) {
      this.chess = new chessjs.Chess(nextProps.fen);
      this._updateBoard();
    }

    if (nextProps.wReserve !== this.state.wReserve) {
      this.setState({wReserve: nextProps.wReserve})
    }

    if (nextProps.bReserve !== this.state.bReserve) {
      this.setState({bReserve: nextProps.bReserve})
    }
  }

  render() {
    if (!_.get(this.state, 'board')) {
      return <div />;
    }

    let bottomColor, topColor, bottomReserve, topReserve;
    if (this.state.flipped) {
      bottomColor = 'b';
      topColor = 'w';
      bottomReserve = this.state.bReserve;
      topReserve = this.state.wReserve;
    } else {
      bottomColor = 'w';
      topColor = 'b';
      bottomReserve = this.state.wReserve;
      topReserve = this.state.bReserve;
    }

    return (
      <div className="ChessGame">
        <Reserve
          color={bottomColor}
          isGameOver={this.state.isGameOver}
          queue={topReserve} />
        <div className="ChessGame__play">
          <Chessboard
            activeSquare={this.state.activeSquare}
            flipped={this.state.flipped}
            moves={this.state.moves}
            board={this.state.board}
            isGameOver={this.state.isGameOver}
            onDropPiece={this.onDropPiece}
            onDragEnd={this.onDragEnd}
            onSelect={this.onSelect}
            turn={this.state.turn} />
          <Sidebar
            bottomColor={bottomColor}
            topColor={topColor}
            isGameOver={this.state.isGameOver}
            onFlip={this.onFlip}
            turn={this.state.turn} />
        </div>
        <Reserve
          color={topColor}
          isGameOver={this.state.isGameOver}
          queue={bottomReserve} />
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
    this.props.onMove({
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

  onFlip = () => {
    this.setState({
      flipped: !this.state.flipped,
      board: this._getBoard({flipped: !this.state.flipped})
    });
  }

  _updateBoard() {
    this.setState({
      board: this._getBoard({flipped: this.state.flipped}),
      isGameOver: this.chess.in_checkmate(), // turn is in checkmate
      turn: this.chess.turn()
    });
  }

  _getBoard({flipped}) {
    let board = this.chess.board();

    if (flipped) {
      board.reverse().forEach(row => row.reverse());
    }

    return board;
  }

  _updateReserve(capturedPiece, color) {
    const reserveName = color === 'w' ? 'wReserve' : 'bReserve';
    const newReserve = this.state[reserveName] + capturedPiece;
    this.setState({ [reserveName]: newReserve });
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

export default ChessGame;
