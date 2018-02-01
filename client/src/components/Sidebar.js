import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import _ from 'lodash';

class Sidebar extends Component {
  static propTypes = {
    counters: PropTypes.object.isRequired,
    bottomColor: PropTypes.oneOf(['w', 'b']),
    topColor: PropTypes.oneOf(['w', 'b']),
    inCheckmate: PropTypes.bool,
    isGameOver: PropTypes.bool,
    turn: PropTypes.string
  }

  static defaultProps = {
    counters: {}
  }

  render() {
    return (
      <div className="Sidebar">
        {this._renderPlayerBox(this.props.topColor)}
        <button className="Sidebar__flip-button" onClick={this.props.onFlip}>
          Flip
        </button>
        {this._renderPlayerBox(this.props.bottomColor)}
      </div>
    );
  }

  _renderPlayerBox(color) {
    return (
      <PlayerBox
        color={color}
        counter={_.get(this.props.counters, color)}
        inCheckmate={this.props.inCheckmate}
        isTurn={color === this.props.turn && !this.props.isGameOver} />
    );
  }
}

const Timer = styled.span`
  font-size: 24px;
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  ${props => props.isTurn && `
    background-color: #feef88;
  `}

  ${props => props.isTimedOut && `
    background-color: #eFAAAA;
  `}
`;

class PlayerBox extends Component {
  static propTypes = {
    // TODO: Rename all props to time
    counter: PropTypes.number,
    isTurn: PropTypes.bool
  }

  render() {
    const { counter } = this.props;

    const formattedTime = counter === undefined ? '-:--' : moment.utc(counter*1000).format('m:ss');

    return <Timer isTurn={this.props.isTurn} isTimedOut={counter === 0}>
      {formattedTime}
    </Timer>;
  }
}

export default Sidebar;