import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getTeam } from '../utils';

const PlayerSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

class PlayerSelection extends Component {
  render() {
    const { username } = this.props;

    return (
      <div>
        <div><b>Username:</b> {username}</div>
        <PlayerSelectionContainer>
          <div>
            <PlayerSelectionButton
              color="b"
              boardNum={0}
              onSelectPlayer={this.props.onSelectPlayer}
              playerUsername={this.props.bUserId0}
              username={username} />
            <PlayerSelectionButton
              color="w"
              boardNum={0}
              onSelectPlayer={this.props.onSelectPlayer}
              playerUsername={this.props.wUserId0}
              username={username} />
          </div>
          <div>
            <PlayerSelectionButton
              color="w"
              boardNum={1}
              onSelectPlayer={this.props.onSelectPlayer}
              playerUsername={this.props.wUserId1}
              username={username} />
            <PlayerSelectionButton
              color="b"
              boardNum={1}
              onSelectPlayer={this.props.onSelectPlayer}
              playerUsername={this.props.bUserId1}
              username={username} />
          </div>
        </PlayerSelectionContainer>
      </div>
    );
  }
}

const PlayerButton = styled.button`
  width: 150px;
  height: 70px;
  display: flex;
  border: 1px solid gray;
  align-items: center;
  justify-content: center;
  margin: 10px;
  font-size: 0.9rem;

  &:not([disabled]) {
    cursor: pointer;
    &:hover {
      background-color: #ddd;
    }
  }

  ${props => props.isSelected && `
    border-color: #25ab25;
    border-width: 2px;
  `}

  ${props => props.isTaken && `
    color: gray;
  `}
`;

const UserLabel = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

class PlayerSelectionButton extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    boardNum: PropTypes.number.isRequired,
    username: PropTypes.string
  };

  render() {
    const { color, boardNum, playerUsername } = this.props;
    const teamNum = getTeam({ color, boardNum });
    const isSelected = this._isSelected();
    const isTaken = !!playerUsername;

    return (
      <PlayerButton
        disabled={isTaken && !isSelected}
        isTaken={isTaken}
        isSelected={this._isSelected()}
        onClick={this.handleClick}>
        <div>
          <UserLabel>
            {getColorLabel(color)}, Team {teamNum}
          </UserLabel>
          <div>{playerUsername}</div>
        </div>
      </PlayerButton>
    );
  }

  handleClick = () => {
    const username = this._isSelected() ? '' : this.props.username;
    const { color, boardNum } = this.props;

    this.props.onSelectPlayer({ color, boardNum, username });
  }

  _isSelected() {
    const { username, playerUsername } = this.props;
    return username && playerUsername === username;
  }
}

function getColorLabel(color) {
  switch (color) {
    case 'w':
      return 'White';
    case 'b':
      return 'Black';
    default:
      console.error('Invalid color');
  }
}

export default PlayerSelection;