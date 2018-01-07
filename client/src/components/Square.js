import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import Piece from './Piece';
import classNames from 'classnames';
import _ from 'lodash';

const squareTarget = {
  // canDrop: (props, monitor) => {
  //   // TODO
  // },

  drop: (props, monitor, component) => {
    const item = monitor.getItem();
    props.onDropPiece({
      from: item.square,
      to: props.square
    });
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

class Square extends Component {
  render() {
    // TODO: move this to higher props
    const isCheckmatedKing = this.props.isGameOver &&
      this.props.pieceType === 'k' &&
      this.props.isTurn;

    return this.props.connectDropTarget(
      <div className={classNames(`Chessboard-square Chessboard-square--${this.props.squareColor}`,
        {
          'Chessboard-square--checkmated': isCheckmatedKing,
          'Chessboard-square--active': this.props.isActive,
          'Chessboard-square--move': this.props.isMove })}>
        {this.getPieceComponent()}
      </div>
    );
  }

  getPieceComponent() {
    if (!this.props.pieceType) {
      return null;
    }

    return (
      <Piece
        color={this.props.pieceColor}
        isGameOver={this.props.isGameOver}
        isTurn={this.props.isTurn}
        onDragEnd={this.props.onDragEnd}
        onSelect={this.props.onSelect}
        type={this.props.pieceType}
        square={this.props.square} />
    );
  }
}

export default DropTarget('PIECE', squareTarget, collect)(Square);