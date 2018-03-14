import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';
import Chessboard from './Chessboard';
import PromotionDialog from './PromotionDialog';
import Sidebar from './Sidebar';
import Reserve from './Reserve';
import { isMove, getTeam } from '../utils/moveUtils';

import { connect } from 'react-redux';
import { dropPiece, dropPieceFromReserve } from '../actions/dropPiece';

const PlayContainer = styled.div`
  display: flex;
`;

const Username = styled.div`
  height: 18px;
  text-align: left;
  margin: 8px 0 8px 14px;
`;

class ChessGame extends Component {
  static propTypes = {
    /* Describe board state */
    activeMoves: PropTypes.array,       // Array of valid moves for activePiece
    activePiece: PropTypes.object,      // Piece selected by the user
    activePromotion: PropTypes.object,  // Object holding promotion info before user has selected the piece to promote to

    /* "Chess data" to show on board, calculated by creating an object from the chess.js library  */
    inCheck: PropTypes.bool,
    inCheckmate: PropTypes.bool,
    turn: PropTypes.string,              // 'w' or 'b'

    counters: PropTypes.object,
    wPlayer: PropTypes.string,
    bPlayer: PropTypes.string,
    isGameOver: PropTypes.bool,
    moves: PropTypes.array,             // History of moves
    isFlipped: PropTypes.bool           // true if board is oriented w/ white at the bottom
  }

  static defaultProps = {
    counters: {},
    moves: []
  }

  render() {
    if (!this.props.moves) {
      return <div />;
    }

    const { isFlipped, isGameOver, wReserve, bReserve } = this.props;
    const activeSquare = _.get(this.props.activePiece, 'square');
    const {
      from: prevFromSquare,
      to: prevToSquare
    } = this._getCurrentMove();
    const topColor = isFlipped ? 'w' : 'b';
    const bottomColor = isFlipped ? 'b' : 'w';
    const topReserve = isFlipped ? wReserve : bReserve;
    const bottomReserve = isFlipped ? bReserve : wReserve;

    return (
      <div className="ChessGame">
        {this._renderReserve(topColor, topReserve)}
        {this._renderUsername(topColor)}
        <PlayContainer>
          <Chessboard
            board={this.props.board}
            boardNum={this.props.boardNum}
            activeSquare={activeSquare}
            flipped={this.props.isFlipped}
            moves={this.props.activeMoves}
            inCheck={this.props.inCheck}
            isFrozen={this._isFrozen()}
            prevFromSquare={prevFromSquare}
            prevToSquare={prevToSquare}
            onDropPiece={this.handleDropPiece}
            onDropPieceFromReserve={this.handleDropPieceFromReserve}
            onSelectPiece={this.handleSelectPiece}
            onSelectSquare={this.handleSelectSquare}
            turn={this.props.turn}
            wPlayer={this.props.wPlayer}
            bPlayer={this.props.bPlayer}
            username={this.props.username} />
          <Sidebar
            moves={this.props.moves}
            currentMoveIndex={this.props.moveIndex}
            counters={this.props.counters}
            bottomColor={bottomColor}
            topColor={topColor}
            inCheckmate={this.props.inCheckmate}
            isGameOver={isGameOver}
            onFirstMove={this.props.onFirstMove}
            onPrevMove={this.props.onPrevMove}
            onNextMove={this.props.onNextMove}
            onLastMove={this.props.onLastMove}
            onSelectMove={this.props.onSelectMove}
            onFlip={this.props.onFlip}
            turn={this.props.turn} />
        </PlayContainer>
        {this._renderUsername(bottomColor)}
        {this._renderReserve(bottomColor, bottomReserve)}
        {this._renderPromotionDialog()}
      </div>
    );
  }

  _getUsername(color) {
    return this.props[`${color}Player`];
  }

  _renderUsername(color) {
    const { boardNum, winner } = this.props;
    let winningText;
    if (winner) {
      const isWinningTeam = getTeam({ color, boardNum }) === getTeam(winner);
      if (isWinningTeam) {
        winningText = ' is victorious!';
      }
    }
    return <Username>
      {this._getUsername(color)}
      <span><i>{winningText}</i></span>
    </Username>
  }

  _renderReserve(color, queue) {
    const { activePiece, turn } = this.props;
    const isPlayer = this._getUsername(color) === this.props.username;

    let activeIndex;
    if (activePiece && activePiece.type === 'reserve' && turn === color) {
      activeIndex = activePiece.index;
    }

    return <Reserve
      activeIndex={activeIndex}
      boardNum={this.props.boardNum}
      color={color}
      isSelectable={!this._isFrozen() && turn === color && isPlayer}
      onSelectPiece={this.handleSelectPieceFromReserve}
      queue={queue} />;
  }

  handleDropPiece = ({from, to }) => {
    // todo: this._isMove(square) on callback
    // if (!this.state.moves) {
    //   return;
    // }

    // TODO: Selector
    const promotionMoves = this.props.activeMoves.filter(move =>
      move.from === from && move.to === to && move.promotion);

    // If promotion
    if (promotionMoves.length > 0) {
      this.props.dispatch({
        type: 'SELECT_PROMOTING_PIECE',
        boardNum: this.props.boardNum,
        from, to,
        pieces: promotionMoves.map(move => move.promotion)
      });
    } else {
      const action = dropPiece({
        boardNum: this.props.boardNum,
        from,
        to,
        lastPosition: this.props.position
      });

      if (action) {
        this.props.dispatch(action);
      }
    }
  }

  handleDropPieceFromReserve = ({ index, type, to }) => {
    const action = dropPieceFromReserve({
      boardNum: this.props.boardNum,
      index,
      to,
      pieceType: type,
      lastPosition: this.props.position
    });

    if (action) {
      this.props.dispatch(action);
    }
  }

  handleSelectPieceFromReserve = (index, color, pieceType) => {
    if (this._isFrozen()) {
      return;
    }

    this.props.dispatch({
      type: 'SELECT_PIECE_FROM_RESERVE',
      boardNum: this.props.boardNum,
      index,
      color,
      pieceType
    });
  }

  handleSelectPromotion = (promotion) => {
    const { from, to } = this.props.activePromotion;

    const action = dropPiece({
      boardNum: this.props.boardNum,
      from,
      to,
      promotion,
      lastPosition: this.props.position
    });

    if (action) {
      this.props.dispatch(action);
    }
  }

  handleSelectPiece = (square, pieceColor) => {
    if (this._isFrozen()) {
      return;
    }

    const { activePiece } = this.props;
    const activePieceType = _.get(activePiece, 'type');
    // If a valid board move is detected, make the move
    if (activePieceType === 'board' && this._isMove(square)) {
      this.handleDropPiece({ from: activePiece.square, to: square });
    // Else select it as the new active piece
    } else {
      this.props.dispatch({
        type: 'SELECT_PIECE',
        boardNum: this.props.boardNum,
        square,
        color: pieceColor
      });
    }
  }

  handleSelectSquare = (square) => {
    if (this._isFrozen()) {
      return;
    }

    const { activePiece } = this.props;
    const activePieceType = _.get(activePiece, 'type');
    // If a valid board move is detected, make the move
    if (activePieceType === 'board' && this._isMove(square)) {
      this.handleDropPiece({from: activePiece.square, to: square});
    // Else if a valid drop from reserve move is detected, make the move
    } else if (activePieceType === 'reserve') {
      this.handleDropPieceFromReserve({
        index: activePiece.index,
        type: activePiece.pieceType,
        to: square
      });
    }
  }

  _renderPromotionDialog() {
    if (this.props.activePromotion) {
      return (
        <PromotionDialog
          color={this.props.turn}
          onSelectPromotion={this.handleSelectPromotion}
          pieces={this.props.activePromotion.pieces} />
      );
    }
  }

  _isFrozen() {
    const { moves, moveIndex, isGameOver } = this.props;
    // True if viewing current move
    const isCurrentMove = _.isEmpty(moves) || moveIndex === moves.length - 1;
    return isGameOver || !isCurrentMove;
  }

  // Current move being viewed
  _getCurrentMove() {
    const { moves, moveIndex } = this.props;

    if (_.isEmpty(moves) || moveIndex === -1) {
      return {};
    } else {
      return moves[moveIndex];
    }
  }

  _isMove(square) {
    return isMove(square, this.props.activeMoves);
  }
}

export default connect()(ChessGame);
