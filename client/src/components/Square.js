import React, { Component } from 'react';

class Square extends Component {
  render() {
    const { color, type, fileNum, rank }  = this.props;
    const squareColor = (fileNum + rank) % 2 === 0 ?
      'light' : 'dark';

    return (
      <div className={`Chessboard-square Chessboard-square--${squareColor}`}>
        {this._getPiece()}
      </div>
    );
  }

  _getPiece() {
    const { color, type } = this.props;
    if (!type) {
      return;
    }

    const imgSrc = color + type.toUpperCase();
    const src = require(`../img/${imgSrc}.svg`);

    return <img src={src} className="Piece__image" alt={type} />;
  }
}

export default Square;