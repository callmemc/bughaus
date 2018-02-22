import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';
import chessjs from '../chess.js';

import Square from './Square';
import Piece from './Piece';
import './Chessboard.css';
import { isMove, getSquare, getIndexes } from '../utils';

const Chess = chessjs.Chess();


const Squares = styled.div`
  position: relative;
`;

const CheckedKingOverlay = styled.div`
  background: radial-gradient(
    ellipse at center,
    rgba(255,0,0,1) 0%,
    rgba(231,0,0,1) 25%,
    rgba(169,0,0,0) 89%,
    rgba(158,0,0,0) 100%);
  z-index: 2;
  width: 48px;
  height: 48px;
  position: absolute;
`;

class Chessboard extends PureComponent {
  static propTypes = {
    flipped: PropTypes.bool,
    isFrozen: PropTypes.bool,
    prevFromSquare: PropTypes.string,
    prevToSquare: PropTypes.string,
    moves: PropTypes.array,
    board: PropTypes.array,

    onDropPiece: PropTypes.func.isRequired,
    onDropPieceFromReserve: PropTypes.func.isRequired,
    onSelectSquare: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    // Resets drag destiniation square to ensure transitions are applied when board are moved,
    //  e.g. when another player moves a piece or when stepping through move history
    if (this.props.board !== nextProps.board) {
      this.setState({ dragDestSquare: undefined });
    }
  }

  render() {
    const { moves, prevFromSquare, prevToSquare } = this.props;

    return (
      <div className="Chessboard">
        <RankCoordinates flipped={this.props.flipped} />
        <Squares>
          {this.renderPieces()}
          {_.map([...Array(8)], (x, rankIndex) =>
            <div className="Chessboard-row" key={rankIndex}>
              {_.map([...Array(8)], (y, fileIndex) => {
                const square = getSquare(rankIndex, fileIndex, this.props.flipped);
                const isCurrSquare = !!prevFromSquare &&
                  (square === prevFromSquare || square === prevToSquare);
                const isDropSquare = !prevFromSquare && square === prevToSquare;

                return <Square
                  key={fileIndex}
                  boardNum={this.props.boardNum}
                  isActive={square === this.props.activeSquare}
                  isDropSquare={isDropSquare}
                  isCurrSquare={isCurrSquare}
                  isValidMove={isMove(square, moves)}
                  onDropPiece={this.handleDropPiece}
                  onDropPieceFromReserve={this.props.onDropPieceFromReserve}
                  onSelect={() => this.props.onSelectSquare(square)}
                  square={square}
                  squareColor={Chess.square_color(square)} />
              })}
            </div>
          )}
          <FileCoordinates flipped={this.props.flipped} />
        </Squares>
      </div>
    );
  }

  _canMovePiece(color) {
    const username = _.get(this.props[`${color}Player`], 'username');
    return !this.props.isFrozen &&
      (username === this.props.username) &&
      (this.props.turn === color);
  }

  renderPieces() {
    const { board, turn, inCheck } = this.props;
    if (!board) {
      return;
    }

    let checkedKing;

    // Note: If you reorder an element in an array while a transition is running, the animation will cut
    //  This is why we must order board determinately by storing them in a board array
    const pieceElements = board.map((pieceObj, i) => {
      if (pieceObj === null) {
        return <div key={i} />;
      }

      const { key, piece, square, color, promotion } = pieceObj;
      const { rankIndex, fileIndex } = getIndexes(square, this.props.flipped);
      const style = {transform: `translate(${fileIndex*48}px, ${rankIndex*48}px)`};

      if (inCheck && turn === color && piece === 'k') {
        checkedKing = <CheckedKingOverlay key='king' style={style} />;
      }

      return (
        <PieceContainer
          key={key}
          style={style}
          shouldTransition={!(square === this.state.dragDestSquare)}>
          <Piece
            boardNum={this.props.boardNum}
            color={color}
            isDraggable={this._canMovePiece(color)}
            onDropPiece={this.handleDropPiece}
            onSelect={() => this.props.onSelectPiece(square, color)}
            pieceType={promotion || piece}
            square={square} />
        </PieceContainer>
      );
    });

    return pieceElements.concat(checkedKing);
  }

  handleDropPiece = ({ from, to }) => {
    this.props.onDropPiece({ from, to });

    // This is used to prevent the transition animation by applying the 'transition: none' style
    //  to the newly rendered component when it has moved to its destiniation square
    this.setState({ dragDestSquare: to });
  }
}

const PieceContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 48px;
  height: 48px;
  display: flex;

  ${props => props.shouldTransition && `
    transition: 0.2s linear;
  `}
`;

class FileCoordinates extends PureComponent {
  render() {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    if (this.props.flipped) {
      files.reverse();
    }

    return (
      <div className="FileCoordinates">
        {_.map(files, file =>
          <div className="FileCoordinates__square" key={file}>{file}</div>)}
      </div>
    )
  }
}

class RankCoordinates extends PureComponent {
  render() {
    const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

    if (this.props.flipped) {
      ranks.reverse();
    }

    return (
      <div className="RankCoordinates">
        {_.map(ranks, rank =>
          <div className="RankCoordinates__square" key={rank}>{rank}</div>)}
      </div>
    )
  }
}

export default Chessboard;