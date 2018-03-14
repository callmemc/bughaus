import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import _ from 'lodash';
import { grey700, grey500, blue700 } from 'material-ui/styles/colors';

import FontIcon from 'material-ui/FontIcon';
import FlipIcon from 'material-ui/svg-icons/action/cached';

const SidebarContainer = styled.div`
  border: 1px solid ${grey500};
  display: flex;
  flex-direction: column;
  font-size: 13px;
  width: 105px;
  margin-bottom: 14px;
  height: 382px;
`;

const MoveContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const MoveControls = styled.div`
  display: flex;
  align-items: center;
`;

const smallIconStyles = {
  fontSize: '14px'
};

const iconStyles = {
  fontSize: '16px'
};

const IconContainer = styled.button`
  background: none;
  border: none;
  padding: 0 2px;
  cursor: pointer;

  &:hover {
    .moveIcon {
      color: ${blue700} !important;
    }

    svg {
      fill: ${blue700} !important;
    }
  }
`;

const Timer = styled.div`
  font-size: 24px;
  height: 40px;
  width: 100%;
  display: flex;
  ${props => props.isTurn && `
    background-color: #feef88;
  `}
  ${props => props.isTimedOut && `
    background-color: #eFAAAA;
  `}
`;

const Time = styled.div`
  margin: auto;
`;

class Sidebar extends Component {
  static propTypes = {
    counters: PropTypes.object.isRequired,
    bottomColor: PropTypes.oneOf(['w', 'b']),
    topColor: PropTypes.oneOf(['w', 'b']),
    moves: PropTypes.array.isRequired,
    inCheckmate: PropTypes.bool,
    isGameOver: PropTypes.bool,
    turn: PropTypes.string
  }

  static defaultProps = {
    counters: {}
  }

  render() {
    return (
      <SidebarContainer>
        {this._renderPlayerBox(this.props.topColor)}
        <MoveContent>
          <MoveControls>
            <IconContainer onClick={this.props.onFlip}>
              <FlipIcon
                color={grey700}
                style={{width: '18px'}} />
            </IconContainer>
            <IconContainer onClick={this.props.onFirstMove}>
              <FontIcon
                className="icon-first moveIcon"
                color={grey700}
                style={smallIconStyles} />
            </IconContainer>
            <IconContainer onClick={this.props.onPrevMove}>
              <FontIcon
                className="icon-previous2 moveIcon"
                color={grey700}
                style={iconStyles} />
            </IconContainer>
            <IconContainer onClick={this.props.onNextMove}>
              <FontIcon
                className="icon-next2 moveIcon"
                color={grey700}
                style={iconStyles} />
            </IconContainer>
            <IconContainer onClick={this.props.onLastMove}>
              <FontIcon
                className="icon-last moveIcon"
                color={grey700}
                style={smallIconStyles} />
            </IconContainer>
          </MoveControls>
          <MoveHistory
            onSelectMove={this.props.onSelectMove}
            currentMoveIndex={this.props.currentMoveIndex}
            moves={this.props.moves} />
        </MoveContent>
        {this._renderPlayerBox(this.props.bottomColor)}
      </SidebarContainer>
    );
  }

  _renderPlayerBox(color) {
    const isTurn = color === this.props.turn && !this.props.isGameOver;
    const counter = _.get(this.props.counters, color)
    const formattedTime = counter === undefined ? '-:--' :
      moment.utc(counter*1000).format('m:ss');

    return (
      <Timer isTurn={isTurn} isTimedOut={counter === 0}>
        <Time>{formattedTime}</Time>
      </Timer>
    );
  }
}

const MoveHistoryContainer = styled.div`
  overflow: scroll;
`;

const Move = styled.div`
  display: flex;
  padding: 2px 0;
`;

const MoveNumber = styled.div`
  margin: 2px 8px 0 2px;
  font-size: 0.65rem;
  width: 15px;
  text-align: right;
`;

function MoveHistory(props) {
  const { moves } = props;
  let rows = [];
  // Note: First move in array is initial position
  for (let i = 0, moveNum = 1; i < moves.length; i+=2, moveNum++) {
    rows.push(
      <Move key={i}>
        <MoveNumber>{moveNum}</MoveNumber>
        <HalfMove
          highlight={props.currentMoveIndex === i}
          move={moves[i]}
          onClick={() => props.onSelectMove(i)} />
        <HalfMove
          highlight={props.currentMoveIndex === i+1}
          move={moves[i+1]}
          onClick={() => props.onSelectMove(i+1)} />
      </Move>
    );
  }

  return (
    <MoveHistoryContainer>
      {rows}
    </MoveHistoryContainer>
  );
}

const MoveContainer = styled.div`
  flex: 1;
  ${props => props.highlight && `
    color: red;
  `}
  ${props => props.selectable && `
    cursor: pointer;
    &:hover {
      color: ${blue700};
    }
  `}
`;

function HalfMove(props) {
  if (!props.move) {
    return <MoveContainer />
  }

  return (
    <MoveContainer
      selectable
      highlight={props.highlight}
      onClick={props.onClick}>
      {props.move.notation}
    </MoveContainer>
  );
}

export default Sidebar;
