import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import chessjs from '../chess.js';

import Square from './Square';
import './Chessboard.css';
import { isMove, getSquare } from '../utils';

const Chess = chessjs.Chess();

class Chessboard extends Component {
  static propTypes = {
    board: PropTypes.array,
    flipped: PropTypes.bool,
    isGameOver: PropTypes.bool,
    prevFromSquare: PropTypes.string,
    prevToSquare: PropTypes.string,
    moves: PropTypes.array,

    onDropPiece: PropTypes.func.isRequired,
    onDropPieceFromReserve: PropTypes.func.isRequired,
    onSelectSquare: PropTypes.func.isRequired
  }

  render() {
    const { board, moves } = this.props;
    if (!board) {
      return <div></div>;
    }

    return (
      <div className="Chessboard">
        <RankCoordinates flipped={this.props.flipped} />
        <div className="Chessboard__squares">
          {_.map(board, (rank, rankIndex) =>
            <div className="Chessboard-row" key={rankIndex}>
              {_.map(rank, (piece, fileIndex) => {
                const square = getSquare(rankIndex, fileIndex, this.props.flipped);
                const squareColor = Chess.square_color(square);
                const isPrevMove = square === this.props.prevFromSquare ||
                  square === this.props.prevToSquare;
                const { color: pieceColor, type: pieceType} = piece || {};
                const isPlayer = pieceColor && this._getUsername(pieceColor) ===
                  this.props.username;
                const isTurn = this.props.turn === pieceColor;
                const hasMovablePiece = isTurn && isPlayer;
                const isChecked = this.props.inCheck && isTurn && pieceType === 'k';

                return <Square
                  key={fileIndex}
                  boardNum={this.props.boardNum}
                  hasMovablePiece={hasMovablePiece}
                  isActive={square === this.props.activeSquare}
                  isPrevMove={isPrevMove}
                  isValidMove={isMove(square, moves)}
                  isChecked={isChecked}
                  isGameOver={this.props.isGameOver}
                  onDropPiece={this.props.onDropPiece}
                  onDropPieceFromReserve={this.props.onDropPieceFromReserve}
                  onSelect={this.props.onSelectSquare}
                  pieceType={pieceType}
                  pieceColor={pieceColor}
                  square={square}
                  squareColor={squareColor} />
              })}
            </div>
          )}
          <FileCoordinates flipped={this.props.flipped} />
        </div>
      </div>
    );
  }

  _getUsername(color) {
    return _.get(this.props[`${color}Player`], 'username');
  }
}

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