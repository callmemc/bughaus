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
  }

  render() {
    if (!_.get(this.state, 'board')) {
      return <div />;
    }

    let bottomColor, topColor, bottomReserve, topReserve;
    if (this.state.flipped) {
      bottomColor = 'b';
      topColor = 'w';
      bottomReserve = this.props.bReserve;
      topReserve = this.props.wReserve;
    } else {
      bottomColor = 'w';
      topColor = 'b';
      bottomReserve = this.props.wReserve;
      topReserve = this.props.bReserve;
    }

    return (
      <div className="ChessGame">
        <Reserve
          color={topColor}
          isGameOver={this.state.isGameOver}
          isTurn={this.state.turn === topColor}
          queue={topReserve} />
        <div className="ChessGame__play">
          <Chessboard
            activeSquare={this.state.activeSquare}
            flipped={this.state.flipped}
            moves={this.state.moves}
            board={this.state.board}
            isGameOver={this.state.isGameOver}
            onDropPiece={this.onDropPiece}
            onDropPieceFromReserve={this.onDropPieceFromReserve}
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
          color={bottomColor}
          isGameOver={this.state.isGameOver}
          isTurn={this.state.turn === bottomColor}
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
    // chess.move() returns null if move was invalid
    if (moveResult) {
      this._makeMove(moveResult);
    }
  }

  onDropPieceFromReserve = ({ type, to }) => {
    const moveResult = this.chess.put({ type, color: this.state.turn }, to);

    if (moveResult) {
      // Have to manually advance turn by modifying fen
      // TODO: Think about forking/wrapping chess.js library and adding this as a function
      const tokens = this.chess.fen().split(' ');
      tokens[1] = (tokens[1] === 'w') ? 'b' : 'w';
      // Passing in 'force' option to force the load of positions that are invalid
      //  in a normal game of chess, but are valid in bughouse (e.g. 9 pawns)
      this.chess.load(tokens.join(' '), {force: true});

      this._makeMove(moveResult, type);
    }
  }

  onSelectPromotion = (promotionPiece) => {
    const { from, to } = this.state.activePromotion;
    const moveResult = this.chess.move({ from, to, promotion: promotionPiece });
    this.setState({ activePromotion: undefined });
    this._makeMove(moveResult);
  }

  _makeMove(moveResult, droppedPiece) {
    this.props.onMove({
      fen: this.chess.fen(),
      capturedPiece: moveResult.captured,
      moveColor: this.state.turn,
      droppedPiece
    });
    this._updateBoard();
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
      fen: this.chess.fen(),
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
