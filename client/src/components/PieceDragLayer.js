import React, { PureComponent } from 'react';
import { DragLayer } from 'react-dnd';
import PieceImage from './PieceImage';

class PieceDragLayer extends PureComponent {
  render() {
    if (!this.props.isDragging || this.props.itemType !== 'PIECE') {
      return null;
    }

    return (
      <div className="PieceDragLayer">
        <div style={this._getItemStyles()}>
          <PieceImage color={this.props.item.color} type={this.props.item.type} />
        </div>
      </div>
    );
  }

  // This is necessary for placing the drag preview with the cursor.
  //  See the DragLayer docs
  _getItemStyles() {
    const { currentOffset } = this.props;
    if (!currentOffset) {
      return {
        display: 'none'
      };
    }

    const { x, y } = currentOffset;
    const transform = `translate(${x}px, ${y}px)`;

    return {
      transform: transform,
      WebkitTransform: transform
    };
  }
}

export default
  DragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }))(PieceDragLayer);