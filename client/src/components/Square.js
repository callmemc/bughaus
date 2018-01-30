import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import Piece from './Piece';
import classNames from 'classnames';

class Square extends Component {
  static propTypes = {
    hasMovablePiece: PropTypes.bool,
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
      this.props.hasMovablePiece;

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
    // TODO: clean up logic for treating drop from piece reserve moves differently
    //  from board moves
    if (!this.props.isGameOver &&
      (this.props.hasMovablePiece || this.props.isValidMove || !this.props.pieceType)) {
      this.props.onSelect(this.props.square, this.props.pieceType);
    }
  }

  getPieceComponent() {
    if (!this.props.pieceType) {
      return null;
    }

    return (
      <Piece
        boardNum={this.props.boardNum}
        color={this.props.pieceColor}
        isDraggable={!this.props.isGameOver && this.props.hasMovablePiece}
        type={this.props.pieceType}
        square={this.props.square} />
    );
  }
}

const squareTarget = {
  canDrop: (props, monitor) => {
    const item = monitor.getItem();

    // Disallow dropping of pieces from one board to the next
    if (item.boardNum !== props.boardNum) {
      return false;
    }

    // Disallow dropping of pieces on other pieces
    // TODO: Reconcile this validation with that in onSelectSquare (!existingPiece)
    //  Having separate validations for dragging vs. clicking squares is confusing
    if (!item.square) {
      return !props.pieceType;
    }

    return true;
  },

  drop: (props, monitor, component) => {
    const item = monitor.getItem();
    if (item.square) {
      props.onDropPiece({
        from: item.square,
        to: props.square
      });
    } else {
      props.onDropPieceFromReserve({
        index: item.index,
        type: item.type,
        color: item.color,
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