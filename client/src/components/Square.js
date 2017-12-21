import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import Piece from './Piece';

const squareTarget = {
  canDrop: (props, monitor) => {
    // TODO
  },

  drop: (props, monitor, component) => {
    // TODO
    console.log('drop');
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

class Square extends Component {
  render() {
    const { color, type, fileNum, rank }  = this.props;
    const squareColor = (fileNum + rank) % 2 === 0 ?
      'light' : 'dark';
    const pieceComponent = type ? <Piece color={color} type={type} /> : null;

    return this.props.connectDropTarget(
      <div className={`Chessboard-square Chessboard-square--${squareColor}`}>
        {pieceComponent}
      </div>
    );
  }
}

export default DropTarget('PIECE', squareTarget, collect)(Square);