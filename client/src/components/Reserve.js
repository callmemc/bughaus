import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Piece from './Piece';

class Reserve extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    queue: PropTypes.string.isRequired
  }

  render() {
    return (
      <div className="Reserve">
        {this.props.queue.split('').filter(val => val).map((piece, i) => (
          <div className="Reserve__piece" key={i}>
            <Piece
              color={this.props.color}
              isGameOver={this.props.isGameOver}
              type={piece} />
          </div>
        ))}
      </div>
    );
  }
}

export default Reserve;