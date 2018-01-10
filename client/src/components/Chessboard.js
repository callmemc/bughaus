import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Square from './Square';
import './Chessboard.css';

class Chessboard extends Component {
  static propTypes = {
    flipped: PropTypes.bool
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
                const isMove = !!(moves && moves.find(move => move.to === square));
                return <Square
                  key={fileIndex}
                  fileNum={fileIndex+1}
                  isActive={square === this.props.activeSquare}
                  isMove={isMove}
                  inCheck={this.props.inCheck}
                  isGameOver={this.props.isGameOver}
                  onDragEnd={this.props.onDragEnd}
                  onDropPiece={this.props.onDropPiece}
                  onDropPieceFromReserve={this.props.onDropPieceFromReserve}
                  onSelect={this.props.onSelect}
                  rankNum={8-rank}
                  pieceType={_.get(piece, 'type')}
                  pieceColor={_.get(piece, 'color')}
                  square={square}
                  squareColor={squareColor}
                  isTurn={this.props.turn === _.get(piece, 'color')} />
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