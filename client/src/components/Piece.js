import React, { Component } from 'react';
import { DragSource } from 'react-dnd';

// Specifies the drag source contract.
const pieceSource = {
  beginDrag: (props) => {
    // TODO
    console.log('begin drag');

    // TODO: Return the data describing the dragged item
    return {
      square: props.square
    };
  },

  endDrag: (props) => {
    // TODO
    console.log('end drag');
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
  };
}

class Piece extends Component {
  render() {
    const { color, type } = this.props;
    const src = require(`../img/${color + type.toUpperCase()}.svg`);
    const { connectDragSource } = this.props;

    return connectDragSource(
      <div>
        <img src={src} className="Piece__image" alt={type} />
      </div>
    );
  }
}

export default DragSource('PIECE', pieceSource, collect)(Piece);