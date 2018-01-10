import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import chessjs from '../chess.js';
import Chessboard from './Chessboard';
import PromotionDialog from './PromotionDialog';
import Sidebar from './Sidebar';
import Reserve from './Reserve';
import { isMove } from '../utils';

class ChessGame extends Component {
  static propTypes = {
    wReserve: PropTypes.string,
    bReserve: PropTypes.string,
    isGameOver: PropTypes.bool,
    onMove: PropTypes.func.isRequired,

    fen: PropTypes.string,
    history: PropTypes.object,
    promotedSquares: PropTypes.object,
    initialFlipped: PropTypes.bool
  }

  constructor(props) {
    super(props);

    // Temporarily storing mutated chess object in component
    this.chess = new chessjs.Chess();

    this.state = {
      /* State that is updatable by parent. See note above componentWillReceiveProps() */
      fen: props.fen,
      promotedSquares: props.promotedSquares || {},   // Holds keys of all squares that have promoted pieces

      /* Describe board, calculated based off this.chess object */
      inCheck: false,
      inCheckmate: false,
      moves: undefined,     // VALID
      turn: undefined,

      /* Describe board state */
      activePromotion: undefined,     // Object holding promotion info before user has selected piece
      activeSquare: undefined,        // Square selected by the user
      flipped: !!this.props.initialFlipped   // true if board is oriented so that white is at the bottom
    };
  }

  // NOTE: This use of 2 sources of truth (fen & promotedSquares) is dangerous.
  //  Relies on componentWillReceiveProps to keep synced with updates from server through socket.
  //  But problems with other options:
  //  - Annoying to have to store state in parent just for the reason of keeping state in sync w/ socket,
  //    when only the relevant board cares about this info
  //  - Not a good idea to have 1 socket per board
  // Note: Reserves can be updated by either board, so they live with the parent
  // TODO: Best solution is probably extract this state to a Redux store, that handles
  //  syncing with the socket
  componentWillReceiveProps (nextProps) {
    if (nextProps.fen !== this.state.fen) {
      this.chess = new chessjs.Chess(nextProps.fen);
      this._updateBoard();
    }

    if (nextProps.promotedSquares !== this.state.promotedSquares) {
      this.setState({ promotedSquares: nextProps.promotedSquares});
    }
  }

  render() {
    if (!_.get(this.state, 'board')) {
      return <div />;
    }

    const { history } = this.props;

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
          isGameOver={this.props.isGameOver}
          isTurn={this.state.turn === topColor}
          queue={topReserve} />
        <div className="ChessGame__play">
          <Chessboard
            activeSquare={this.state.activeSquare}
            flipped={this.state.flipped}
            moves={this.state.moves}
            board={this.state.board}
            inCheck={this.state.inCheck}
            isGameOver={this.props.isGameOver}
            prevFromSquare={_.get(history, 'prevFromSquare')}
            prevToSquare={_.get(history, 'prevToSquare')}
            onDropPiece={this.onDropPiece}
            onDropPieceFromReserve={this.onDropPieceFromReserve}
            onSelectSquare={this.onSelectSquare}
            turn={this.state.turn} />
          <Sidebar
            bottomColor={bottomColor}
            topColor={topColor}
            inCheckmate={this.state.inCheckmate}
            onFlip={this.onFlip}
            turn={this.state.turn} />
        </div>
        <Reserve
          color={bottomColor}
          isGameOver={this.props.isGameOver}
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

    // If promotion
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
      this._makeMove({ capturedPiece: moveResult.captured, from, to });
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

      this._makeMove({ droppedPiece: type, to });
    }
  }

  onSelectPromotion = (promotionPiece) => {
    const { from, to } = this.state.activePromotion;
    const moveResult = this.chess.move({ from, to, promotion: promotionPiece });

    this.setState({ activePromotion: undefined });
    this._makeMove({ capturedPiece: moveResult.captured, from, to, isPromotion: true });
  }

  _makeMove({ capturedPiece, droppedPiece, from, to, isPromotion }) {
    // If move captures a promoted piece, turn it back to pawn
    if (capturedPiece && this.state.promotedSquares[to]) {
      delete this.state.promotedSquares[to];
      this.setState({ promotedSquares: {...this.state.promotedSquares} });
      capturedPiece = 'p';
    }

    // If moving a promoted piece, update tracked square
    if (this.state.promotedSquares[from] || isPromotion) {
      // If move is not a new promotion, remove previously tracked square
      if (this.state.promotedSquares[from]) {
        delete this.state.promotedSquares[from];
      }
      this.setState({
        promotedSquares: {...this.state.promotedSquares, [to]: true}
      });
    }

    this.props.onMove({
      capturedPiece,
      droppedPiece,
      fen: this.chess.fen(),
      isCheckmate: this.chess.in_checkmate(),
      moveColor: this.state.turn,
      promotedSquares: this.state.promotedSquares,
      history: {
        prevFromSquare: from,
        prevToSquare: to
      }
    });

    this._updateBoard();
  }

  onSelectSquare = (square) => {
    const { activeSquare, moves } = this.state;
    if (activeSquare && isMove(square, moves)) {
      this.onDropPiece({from: activeSquare, to: square});
    } else {
      this.setState({
        activeSquare: square,
        moves: this.chess.moves({ verbose: true, square })
      });
    }

    // TODO: Allow deselection of piece
    // if (this.state.activeSquare === square) {
    //   this.setState({
    //     activeSquare: undefined,
    //     moves: undefined
    //   });
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
      inCheckmate: this.chess.in_checkmate(), // turn is in checkmate
      inCheck: this.chess.in_check(),
      turn: this.chess.turn(),

      activeSquare: undefined,
      moves: undefined
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
