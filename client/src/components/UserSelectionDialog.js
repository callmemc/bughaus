import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import styled from 'styled-components';
import { getTeam } from '../utils';

const UserSelectionContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const dialogStyle = {textAlign: 'center'};

class UserSelectionDialog extends Component {
  static propTypes = {
    currentUser: PropTypes.object,
    wUserId0: PropTypes.string,
    bUserId0: PropTypes.string,
    wUserId1: PropTypes.string,
    bUserId1: PropTypes.string,
    onSelectUser: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      username: ''
    };
  }

  render() {
    const currentUsername = _.get(this.props.currentUser, 'username');

    return (
      <Dialog open={true} style={dialogStyle}>
        <div>
          <TextField
            id="username"
            hintText="Enter username"
            value={this.state.username}
            onChange={this.handleChange} />
        </div>
        <UserSelectionContainer>
          <div>
            <UserSelection
              color="b"
              boardNum={0}
              onClick={this.handleClick}
              username={this.props.bUserId0}
              currentUsername={currentUsername} />
            <UserSelection
              color="w"
              boardNum={0}
              onClick={this.handleClick}
              username={this.props.wUserId0}
              currentUsername={currentUsername} />
          </div>
          <div>
            <UserSelection
              color="w"
              boardNum={1}
              onClick={this.handleClick}
              username={this.props.wUserId1}
              currentUsername={currentUsername} />
            <UserSelection
              color="b"
              boardNum={1}
              onClick={this.handleClick}
              username={this.props.bUserId1}
              currentUsername={currentUsername} />
          </div>
        </UserSelectionContainer>
      </Dialog>
    );
  }

  handleChange = (event) => {
    this.setState({ username: event.target.value });
  }

  handleClick = (color, boardNum) => {
    // TODO: Make sure username is unique
    this.props.onSelectUser({ color, boardNum, username: this.state.username });
  }
}

const UserButton = styled.button`
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
`;

const UserLabel = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

class UserSelection extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    boardNum: PropTypes.number.isRequired,
    username: PropTypes.string
  };

  render() {
    const { color, boardNum, username, currentUsername } = this.props;
    const teamNum = getTeam({ color, boardNum });
    const isSelected = currentUsername && currentUsername === username;

    return (
      <UserButton isSelected={isSelected} onClick={this.handleClick} disabled={username}>
        <div>
          <UserLabel>
            {getColorLabel(color)}, Team {teamNum}
          </UserLabel>
          <div>{username}</div>
        </div>
      </UserButton>
    );
  }

  handleClick = () => {
    this.props.onClick(this.props.color, this.props.boardNum);
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

export default UserSelectionDialog;