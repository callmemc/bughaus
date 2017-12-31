import React, { Component } from 'react';

class PieceImage extends Component {
  render() {
    const { color, type } = this.props;
    const src = require(`../img/${color + type.toUpperCase()}.svg`);

    return <img src={src} className="Piece__image" draggable="false"
      alt={type} />;
  }
}

export default PieceImage;