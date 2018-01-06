import React, { Component } from 'react';
import _ from 'lodash';

import Square from './Square';
import './Chessboard.css';

class Chessboard extends Component {
  render() {
    const { board, moves } = this.props;
    if (!board) {
      return <div></div>;
    }
    return (
      <div>
        {_.map(board, (row, rank) =>
          <div className="Chessboard-row" key={rank}>
            {_.map(row, (piece, fileIndex) => {
              const fileNum = fileIndex+1;
              const rankNum = 8 - rank;
              const square = String.fromCharCode(96 + fileNum) + rankNum;
              const squareColor = (fileNum + rankNum) % 2 === 0 ?
                'dark' : 'light';
              const isMove = !!(moves && moves.find(move => move.to === square));
              return <Square
                key={fileIndex}
                fileNum={fileIndex+1}
                isActive={square === this.props.activeSquare}
                isMove={isMove}
                isGameOver={this.props.isGameOver}
                onDragEnd={this.props.onDragEnd}
                onSelect={this.props.onSelect}
                makeMove={this.props.makeMove}
                rankNum={8-rank}
                pieceType={_.get(piece, 'type')}
                pieceColor={_.get(piece, 'color')}
                square={square}
                squareColor={squareColor}
                isTurn={this.props.turn === _.get(piece, 'color')} />
            })}
          </div>
        )}
      </div>
    );
  }
}

export default Chessboard;