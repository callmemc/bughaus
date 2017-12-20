import React, { Component } from 'react';
import _ from 'lodash';

import Square from './Square';
import './Chessboard.css';

class Chessboard extends Component {
  render() {
    const { board } = this.props;
    if (!board) {
      return <div></div>;
    }
    return (
      <div>
        {_.map(board, (row, rank) =>
          <div className="Chessboard-row" key={rank}>
            {_.map(row, (piece, fileIndex) =>
              <Square
                key={fileIndex}
                fileNum={fileIndex+1}
                rank={rank+1}
                type={piece && piece.type}
                color={piece && piece.color} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Chessboard;