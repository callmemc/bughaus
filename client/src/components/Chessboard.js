import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Square from './Square';
import './Chessboard.css';
import { isMove } from '../utils';

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
          {_.map(board, (row, rank) =>
            <div className="Chessboard-row" key={rank}>
              {_.map(row, (piece, fileIndex) => {
                const fileNum = this.props.flipped ? 8 - fileIndex : fileIndex + 1;
                const rankNum = this.props.flipped ? rank + 1 : 8 - rank;
                const square = String.fromCharCode(96 + fileNum) + rankNum;
                const squareColor = (fileNum + rankNum) % 2 === 0 ?
                  'dark' : 'light';
                const isPrevMove = square === this.props.prevFromSquare ||
                  square === this.props.prevToSquare;

                return <Square
                  key={fileIndex}
                  hasValidPiece={this.props.turn === _.get(piece, 'color')}
                  isActive={square === this.props.activeSquare}
                  isPrevMove={isPrevMove}
                  isValidMove={isMove(square, moves)}
                  inCheck={this.props.inCheck}
                  isGameOver={this.props.isGameOver}
                  onDropPiece={this.props.onDropPiece}
                  onDropPieceFromReserve={this.props.onDropPieceFromReserve}
                  onSelect={this.props.onSelectSquare}
                  pieceType={_.get(piece, 'type')}
                  pieceColor={_.get(piece, 'color')}
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