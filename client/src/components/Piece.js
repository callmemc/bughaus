import React, { Component } from 'react';

class Piece extends Component {
  render() {
    const color = this.props.color;

    return (
      <div className='Chessboard-square'>
        {this.props.type}
      </div>
    );
  }
}

export default Piece;