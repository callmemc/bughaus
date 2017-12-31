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
    props.makeMove({
      from: item.square,
      to: getSquare(props.fileNum, props.rankNum)
    });
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

function getSquare(fileNum, rankNum) {
  const fileChr = String.fromCharCode(96 + fileNum);
  return fileChr + rankNum;
}

class Square extends Component {
  render() {
    const { fileNum, rankNum, piece }  = this.props;
    const squareColor = (fileNum + rankNum) % 2 === 0 ?
      'dark' : 'light';
    const isCheckmatedKing = this.props.isGameOver && _.get(piece, 'type') === 'k'
      && this.props.isTurn;

    return this.props.connectDropTarget(
      <div className={classNames(`Chessboard-square Chessboard-square--${squareColor}`,
        { 'Chessboard-square--checkmated': isCheckmatedKing })}>
        {this.getPieceComponent()}
      </div>
    );
  }

  getPieceComponent() {
    const { fileNum, rankNum, piece }  = this.props;
    if (!piece) {
      return null;
    }

    const square = getSquare(fileNum, rankNum);

    return (
      <Piece color={piece.color}
        isGameOver={this.props.isGameOver}
        type={piece.type} square={square} />
    );
  }
}

export default DropTarget('PIECE', squareTarget, collect)(Square);