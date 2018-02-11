import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import PieceImage from './PieceImage';
import dropTarget from '../utils/dropTarget';

class Piece extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    isDraggable: PropTypes.bool,
    pieceType: PropTypes.string.isRequired
  }

  componentDidMount() {
    // Use empty image as a drag preview so browsers don't draw it
    // and we can draw whatever we want on the custom drag layer instead.
    this.props.connectDragPreview(getEmptyImage());
  }

  render() {
    const { color, pieceType, connectDragSource, isDragging } = this.props;
    const opacity = isDragging ? 0.5 : 1;

    return this.props.connectDropTarget(connectDragSource(
      <div className="Piece"
        style={{opacity}}
        onMouseDown={this.props.onSelect}>
        <PieceImage color={color} type={pieceType} />
      </div>
    ));
  }
}

// Specifies the drag source contract.
const pieceSource = {
  beginDrag: (props) => {
    // Return the data describing the dragged item
    return {
      color: props.color,
      type: props.pieceType,
      square: props.square,
      index: props.index,
      boardNum: props.boardNum
    };
  },

  canDrag: (props, monitor) => {
    // TODO: Figure out way to not have to pass down props many layers
    // Redux + wrapper component?
    return props.isDraggable;
  }
};

function collectSource(connect, monitor) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

function collectTarget(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

export default DropTarget('PIECE', dropTarget, collectTarget)(
  DragSource('PIECE', pieceSource, collectSource)(Piece));