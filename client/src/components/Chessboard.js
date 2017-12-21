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
                makeMove={this.props.makeMove}
                rankNum={8-rank}
                piece={piece} />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default Chessboard;