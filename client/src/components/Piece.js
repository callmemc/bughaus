import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import PieceImage from './PieceImage';

class Piece extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    isTurn: PropTypes.bool,
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
      <div className="Piece" style={{opacity}} onMouseDown={this.handleMouseDown}>
        <PieceImage color={color} type={type} />
      </div>
    );
  }

  handleMouseDown = () => {
    if (this.props.isTurn && !this.props.isGameOver) {
      this.props.onSelect(this.props.square);
    }
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
  },

  canDrag: (props, monitor) => {
    // TODO: Figure out way to not have to pass down props many layers
    // Redux + wrapper component?
    return !props.isGameOver && props.isTurn;
  },

  endDrag: (props) => {
    props.onDragEnd();
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