import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Piece from './Piece';

class Reserve extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    queue: PropTypes.array.isRequired
  }

  render() {
    return (
      <div className="Reserve">
        {this.props.queue.map((piece, i) => (
          <div className="Reserve__piece" key={i}>
            <Piece color={this.props.color} type={piece} />
          </div>
        ))}
      </div>
    );
  }
}

export default Reserve;