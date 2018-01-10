import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Piece from './Piece';

class Reserve extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    isTurn: PropTypes.bool,
    queue: PropTypes.string.isRequired
  }

  render() {
    return (
      <div className="Reserve">
        {this.props.queue.split('').filter(val => val).map((piece, i) => (
          <div className="Reserve__piece" key={i}>
            <Piece
              color={this.props.color}
              isDraggable={!this.props.isGameOver && this.props.isTurn}
              type={piece} />
          </div>
        ))}
      </div>
    );
  }
}

export default Reserve;