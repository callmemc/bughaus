import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Sidebar extends Component {
  static propTypes = {
    turn: PropTypes.string
  }

  render() {
    const { turn } = this.props;
    return (
      <div className="Sidebar">
        <PlayerBox turn={turn} color='b'  />
        <PlayerBox turn={turn} color='w' isUser />
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
    if (this.props.turn !== this.props.color) {
      return <div />;
    }

    const text = this.props.isUser ? 'Your turn' : 'Waiting for opponent';
    return <div>{text}</div>;
  }
}

export default Sidebar;