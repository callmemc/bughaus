import React, { Component } from 'react';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import PieceImage from './PieceImage';

// Specifies the drag source contract.
const pieceSource = {
  beginDrag: (props) => {
    // Return the data describing the dragged item
    return {
      color: props.color,
      type: props.type,
      square: props.square
    };
  }
};

function collect(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class Piece extends Component {
  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const { color, type, connectDragSource, isDragging } = this.props;
    const opacity = isDragging ? 0 : 1;

    return connectDragSource(
      <div className="Piece" style={{opacity}}>
        <PieceImage color={color} type={type} />
      </div>
    );
  }
}

export default DragSource('PIECE', pieceSource, collect)(Piece);