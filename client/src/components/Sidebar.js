import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Sidebar extends Component {
  static propTypes = {
    bottomColor: PropTypes.oneOf(['w', 'b']),
    topColor: PropTypes.oneOf(['w', 'b']),
    isGameOver: PropTypes.bool,
    turn: PropTypes.string
  }

  render() {
    const { turn } = this.props;
    return (
      <div className="Sidebar">
        <PlayerBox
          color={this.props.topColor}
          isGameOver={this.props.isGameOver}
          turn={turn} />
        <button onClick={this.props.onFlip}>
          Flip
        </button>
        <PlayerBox
          color={this.props.bottomColor}
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

      return <div className="PlayerBox--active">{text}</div>;
    } else {
      return <div className="PlayerBox" />;
    }
  }
}

export default Sidebar;