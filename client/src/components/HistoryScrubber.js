import React, { Component } from 'react';
import styled from 'styled-components';
import FontIcon from 'material-ui/FontIcon';
import { blue700, grey700 } from 'material-ui/styles/colors';

const Container = styled.div`
  text-align: center;
`;

class HistoryScrubber extends Component {
  render() {
    return (
      <Container>
        <ControlButton
          iconName="first"
          onClick={this.props.onFirstMove} />
        <ControlButton
          iconName="previous2"
          onClick={this.props.onPrevMove}
          size="large" />
        <ControlButton
          iconName="next2"
          onClick={this.props.onNextMove}
          size="large" />
        <ControlButton
          iconName="last"
          onClick={this.props.onLastMove} />
      </Container>
    );
  }
}

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

function ControlButton(props) {
  const fontSize = props.size === 'large' ? '20px' : '18px';

  return (
    <IconContainer onClick={props.onClick}>
      <FontIcon
        className={`icon-${props.iconName} moveIcon`}
        color={grey700}
        style={{ fontSize }} />
    </IconContainer>
  );
}

export default HistoryScrubber;
