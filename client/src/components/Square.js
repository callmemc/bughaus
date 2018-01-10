import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import Piece from './Piece';
import classNames from 'classnames';

class Square extends Component {
  static propTypes = {
    hasValidPiece: PropTypes.bool,
    isPrevMove: PropTypes.bool,
    isValidMove: PropTypes.bool,
    isActive: PropTypes.bool,
    inCheck: PropTypes.bool,
    isGameOver: PropTypes.bool
  }

  render() {
    // TODO: move this to higher props
    const isCheckedKing = this.props.inCheck &&
      this.props.pieceType === 'k' &&
      this.props.hasValidPiece;

    return this.props.connectDropTarget(
      <div className={classNames(`Chessboard-square Chessboard-square--${this.props.squareColor}`,
        {
          'Chessboard-square--checked': isCheckedKing,
          'Chessboard-square--active': this.props.isActive,
          'Chessboard-square--previous': this.props.isPrevMove,
          'Chessboard-square--valid': this.props.isValidMove })}
        onMouseDown={this.handleMouseDown} >
        {this.getPieceComponent()}
      </div>
    );
  }

  handleMouseDown = () => {
    if (!this.props.isGameOver && (this.props.hasValidPiece || this.props.isValidMove)) {
      this.props.onSelect(this.props.square);
    }
  }

  getPieceComponent() {
    if (!this.props.pieceType) {
      return null;
    }

    return (
      <Piece
        color={this.props.pieceColor}
        isDraggable={!this.props.isGameOver && this.props.hasValidPiece}
        type={this.props.pieceType}
        square={this.props.square} />
    );
  }
}

const squareTarget = {
  // canDrop: (props, monitor) => {
  //   // TODO
  // },

  drop: (props, monitor, component) => {
    const item = monitor.getItem();
    if (item.square) {
      props.onDropPiece({
        from: item.square,
        to: props.square
      });
    } else {
      props.onDropPieceFromReserve({
        type: item.type,
        to: props.square
      })
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

export default DropTarget('PIECE', squareTarget, collect)(Square);