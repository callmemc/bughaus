import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import classNames from 'classnames';
import dropTarget from '../utils/dropTarget';

class Square extends Component {
  static propTypes = {
    isPrevMove: PropTypes.bool,
    isValidMove: PropTypes.bool,
    isActive: PropTypes.bool,
    isChecked: PropTypes.bool
  }

  render() {
    return this.props.connectDropTarget(
      <div className={classNames(`Chessboard-square Chessboard-square--${this.props.squareColor}`,
        {
          'Chessboard-square--checked': this.props.isChecked,
          'Chessboard-square--active': this.props.isActive,
          'Chessboard-square--previous': this.props.isPrevMove,
          'Chessboard-square--valid': this.props.isValidMove })}
        onMouseDown={this.handleMouseDown} />
    );
  }

  handleMouseDown = () => {
    this.props.onSelect(this.props.square);
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

export default DropTarget('PIECE', dropTarget, collect)(Square);