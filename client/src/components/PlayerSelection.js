import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import _ from 'lodash';
import { getTeam } from '../utils';

const PlayerSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

class PlayerSelection extends Component {
  render() {
    const { username, connections } = this.props;

    return (
      <div>
        <div><b>Username:</b> {username}</div>
        <PlayerSelectionContainer>
          <div>
            <PlayerSelectionButton
              color="b"
              boardNum={0}
              onSelectPlayer={this.props.onSelectPlayer}
              onDeselectPlayer={this.props.onDeselectPlayer}
              player={this.props.bPlayer0}
              isConnected={_.get(connections[0], 'b')}
              username={username} />
            <PlayerSelectionButton
              color="w"
              boardNum={0}
              onSelectPlayer={this.props.onSelectPlayer}
              onDeselectPlayer={this.props.onDeselectPlayer}
              player={this.props.wPlayer0}
              isConnected={_.get(connections[0], 'w')}
              username={username} />
          </div>
          <div>
            <PlayerSelectionButton
              color="w"
              boardNum={1}
              onSelectPlayer={this.props.onSelectPlayer}
              onDeselectPlayer={this.props.onDeselectPlayer}
              player={this.props.wPlayer1}
              isConnected={_.get(connections[1], 'w')}
              username={username} />
            <PlayerSelectionButton
              color="b"
              boardNum={1}
              onSelectPlayer={this.props.onSelectPlayer}
              onDeselectPlayer={this.props.onDeselectPlayer}
              player={this.props.bPlayer1}
              isConnected={_.get(connections[1], 'b')}
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

const DisconnectedIcon = styled.span`
  color: red;
  margin-right: 3px;
  font-size: 18px;
`;

class PlayerSelectionButton extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    boardNum: PropTypes.number.isRequired,
    username: PropTypes.string
  };

  render() {
    const { color, boardNum, player, isConnected } = this.props;
    const teamNum = getTeam({ color, boardNum });
    const isSelected = this._isSelected();

    return (
      <PlayerButton
        disabled={isConnected && !isSelected}
        isTaken={isConnected}
        isSelected={this._isSelected()}
        onClick={this.handleClick}>
        <div>
          <UserLabel>
            {getColorLabel(color)}, Team {teamNum}
          </UserLabel>
          <div>
            {this._renderStatus(isConnected)}
            {player}
          </div>
        </div>
      </PlayerButton>
    );
  }

  _renderStatus(isConnected) {
    if (!isConnected && this.props.player) {
      return <DisconnectedIcon>&times;</DisconnectedIcon>;
    }
  }

  handleClick = () => {
    const { color, boardNum, username } = this.props;

    if (this._isSelected()) {
      this.props.onDeselectPlayer({ color, boardNum });
    } else {
      this.props.onSelectPlayer({ color, boardNum, username });
    }
  }

  _isSelected() {
    const { username, player } = this.props;
    return username && player === username;
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