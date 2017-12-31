import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Sidebar extends Component {
  static propTypes = {
    isGameOver: PropTypes.bool,
    turn: PropTypes.string
  }

  render() {
    const { turn } = this.props;
    return (
      <div className="Sidebar">
        <PlayerBox
          color='b'
          isGameOver={this.props.isGameOver}
          turn={turn} />
        <PlayerBox
          color='w'
          isGameOver={this.props.isGameOver}
          turn={turn}
          isUser />
      </div>
    );
  }
}

class PlayerBox extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    isUser: PropTypes.bool,
    turn: PropTypes.string
  }

  render() {
    let text;

    if (this.props.turn === this.props.color) {
      if (this.props.isGameOver) {
        text = 'Checkmated';
      } else {
        text =  this.props.isUser ? 'Your turn' : 'Waiting for opponent';
      }
    }

    return <div>{text}</div>;
  }
}

export default Sidebar;