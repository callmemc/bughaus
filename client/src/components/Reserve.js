import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Piece from './Piece';

class Reserve extends Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    color: PropTypes.string.isRequired,
    isTurn: PropTypes.bool,
    onSelectPiece: PropTypes.func.isRequired,
    queue: PropTypes.string.isRequired
  }

  render() {
    return (
      <div className="Reserve">
        {this.props.queue.split('').filter(val => val).map((piece, index) => (
          <ReservePiece
            key={index}
            color={this.props.color}
            index={index}
            isActive={this.props.activeIndex === index}
            isDraggable={!this.props.isGameOver && this.props.isTurn}
            isSelectable={this.props.isTurn}
            onSelect={this.props.onSelectPiece}
            type={piece} />
        ))}
      </div>
    );
  }
}

class ReservePiece extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isActive: PropTypes.bool,
    isDraggable: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired
  }

  render() {
    return (
      <div className={classNames("Reserve__piece",
        {'Reserve__piece--active': this.props.isActive})}
        onMouseDown={this.handleMouseDown}>
        <Piece
          color={this.props.color}
          index={this.props.index}
          isDraggable={this.props.isDraggable}
          type={this.props.type} />
      </div>
    );
  }

  handleMouseDown = () => {
    if (this.props.isSelectable) {
      this.props.onSelect(this.props.index, this.props.color, this.props.type);
    }
  }
}

export default Reserve;