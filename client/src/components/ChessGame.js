import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';
import chessjs from '../chess.js';
import Chessboard from './Chessboard';
import PromotionDialog from './PromotionDialog';
import Sidebar from './Sidebar';
import Reserve from './Reserve';
import { isMove } from '../utils';
import * as sounds from '../sounds';

const Username = styled.div`
  height: 18px;
  text-align: left;
  margin: 8px 0 8px 14px;
`;

class ChessGame extends Component {
  static propTypes = {
    wUserId: PropTypes.string,
    bUserId: PropTypes.string,
    wReserve: PropTypes.string,
    bReserve: PropTypes.string,
    isGameOver: PropTypes.bool,
    onMove: PropTypes.func.isRequired,

    fen: PropTypes.string,
    history: PropTypes.object,
    promotedSquares: PropTypes.object,
    isFlipped: PropTypes.bool           // true if board is oriented w/ white at the bottom
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
      moves: undefined,       // Array of valid moves
      turn: undefined,        // 'w' or 'b'

      /* Describe board state */
      activePromotion: undefined,     // Object holding promotion info before user has selected piece
      activePiece: undefined         // Piece selected by the user
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

    // NOTE: This is confusing.
    // TODO: Need to think of a better way to do this. Probably involves Redux
    if (nextProps.isFlipped !== this.props.isFlipped) {
      this.setState({
        board: this._getBoard({ flipped: nextProps.isFlipped })
      });
    }
  }

  render() {
    if (!_.get(this.state, 'board')) {
      return <div />;
    }

    const { history } = this.props;
    const { activePiece } = this.state;

    let bottomColor, topColor, bottomId, topId;

    if (this.props.isFlipped) {
      bottomColor = 'b';
      topColor = 'w';
      bottomId = this.props.bUserId;
      topId = this.props.wUserId;
    } else {
      bottomColor = 'w';
      topColor = 'b';
      bottomId = this.props.wUserId;
      topId = this.props.bUserId;
    }

    let activeSquare;
    if (activePiece && activePiece.type === 'board') {
      activeSquare = activePiece.square;
    }

    return (
      <div className="ChessGame">
        {this._renderReserve(topColor)}
        <Username>{topId}</Username>
        <div className="ChessGame__play">
          <Chessboard
            boardNum={this.props.boardNum}
            activeSquare={activeSquare}
            flipped={this.props.isFlipped}
            moves={this.state.moves}
            board={this.state.board}
            inCheck={this.state.inCheck}
            isGameOver={this.props.isGameOver}
            prevFromSquare={_.get(history, 'prevFromSquare')}
            prevToSquare={_.get(history, 'prevToSquare')}
            onDropPiece={this.onDropPiece}
            onDropPieceFromReserve={this.onDropPieceFromReserve}
            onSelectSquare={this.onSelectSquare}
            turn={this.state.turn}
            wUserId={this.props.wUserId}
            bUserId={this.props.bUserId}
            username={this.props.username} />
          <Sidebar
            bottomColor={bottomColor}
            topColor={topColor}
            inCheckmate={this.state.inCheckmate}
            onFlip={this.onFlip}
            turn={this.state.turn} />
        </div>
        <Username>{bottomId}</Username>
        {this._renderReserve(bottomColor)}
        {this._renderPromotionDialog()}
      </div>
    );
  }

  _renderReserve(color) {
    const { activePiece, turn } = this.state;
    const { isGameOver, username } = this.props;
    const isPlayer = this.props[`${color}UserId`] === username;

    let activeIndex;
    if (activePiece && activePiece.type === 'reserve'  && activePiece.color === color) {
      activeIndex = activePiece.index;
    }

    return <Reserve
      activeIndex={activeIndex}
      boardNum={this.props.boardNum}
      color={color}
      isGameOver={isGameOver}
      isSelectable={!isGameOver && turn === color && isPlayer}
      onSelectPiece={this.onSelectPieceFromReserve}
      queue={this.props[`${color}Reserve`]} />;
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

  onDropPieceFromReserve = ({ index, type, to, color }) => {
    // Disallow dropping pawns on back row
    const rank = to[1];
    if (type === 'p') {
      const isBackRank = (color === 'w' && rank === '8') ||
        (color === 'b' && rank === '1');
      if (isBackRank) {
        return;
      }
    }

    const moveResult = this.chess.put({ type, color: this.state.turn }, to);

    if (moveResult) {
      // Have to manually advance turn by modifying fen
      // TODO: Think about forking/wrapping chess.js library and adding this as a function
      const tokens = this.chess.fen().split(' ');
      tokens[1] = (tokens[1] === 'w') ? 'b' : 'w';
      // Passing in 'force' option to force the load of positions that are invalid
      //  in a normal game of chess, but are valid in bughouse (e.g. 9 pawns)
      this.chess.load(tokens.join(' '), {force: true});

      this._makeMove({ droppedPieceIndex: index, to });
    }
  }

  onSelectPieceFromReserve = (index, color, piece) => {
    this.setState({
      activePiece: { type: 'reserve', index, color, piece },
      moves: undefined
    });
  }

  onSelectPromotion = (promotionPiece) => {
    const { from, to } = this.state.activePromotion;
    const moveResult = this.chess.move({ from, to, promotion: promotionPiece });

    this.setState({ activePromotion: undefined });
    this._makeMove({ capturedPiece: moveResult.captured, from, to, isPromotion: true });
  }

  onSelectSquare = (square, existingPiece) => {
    const { activePiece, moves } = this.state;
    const activePieceType = _.get(activePiece, 'type');
    // If a valid board move is detected, make the move
    if (activePieceType === 'board' && isMove(square, moves)) {
      this.onDropPiece({from: activePiece.square, to: square});
      return;
    // Else if a valid drop from reserve move is detected, make the move
    } else if (activePieceType === 'reserve' && !existingPiece) {
      this.onDropPieceFromReserve({
        index: activePiece.index,
        type: activePiece.piece,
        color: activePiece.color,
        to: square
      });
      return;
    // Else if a piece is on the square, select it as the new active piece
    } else if (existingPiece) {
      this.setState({
        activePiece: { type: 'board', square },
        moves: this.chess.moves({ verbose: true, square })
      });
    }

    // TODO: Allow deselection of piece
    // if (this.state.activePiece === square) {
    //   this.setState({
    //     activePiece: undefined,
    //     moves: undefined
    //   });
    // }
  }

  _makeMove({ capturedPiece, droppedPieceIndex, from, to, isPromotion }) {
    // Play sound
    if (capturedPiece) {
      sounds.playCaptureSound();
    } else {
      sounds.playMoveSound();
    }

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
      droppedPieceIndex,
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

  _updateBoard() {
    this.setState({
      board: this._getBoard({flipped: this.props.isFlipped}),
      fen: this.chess.fen(),
      inCheckmate: this.chess.in_checkmate(), // turn is in checkmate
      inCheck: this.chess.in_check(),
      turn: this.chess.turn(),

      activePiece: undefined,
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

  onFlip = () => {
    this.props.onFlip();

    this.setState({
      board: this._getBoard({flipped: !this.props.isFlipped})
    });
  }
}

export default ChessGame;
