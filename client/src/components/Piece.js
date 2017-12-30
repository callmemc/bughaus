import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import PieceImage from './PieceImage';

class Piece extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const { color, type, connectDragSource, isDragging } = this.props;
    const opacity = isDragging ? 0.5 : 1;

    return connectDragSource(
      <div className="Piece" style={{opacity}}>
        <PieceImage color={color} type={type} />
      </div>
    );
  }
}

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

export default DragSource('PIECE', pieceSource, collect)(Piece);