import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import classNames from 'classnames';
import './UserSelection.css';
import { getTeam } from '../utils';

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
      <Dialog className="UserSelectionDialog" open={true}>
        <div>
          <TextField
            id="username"
            hintText="Enter username"
            value={this.state.username}
            onChange={this.handleChange} />
        </div>
        <div className="UserSelection__container">
          <div className="UserSelection__game">
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
          <div className="UserSelection__game">
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
        </div>
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

class UserSelection extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    boardNum: PropTypes.number.isRequired,
    username: PropTypes.string
  };

  render() {
    const { color, boardNum, username, currentUsername } = this.props;
    const isSelected = currentUsername && currentUsername === username;

    return (
      <button className={classNames("UserSelection", { "UserSelection--selected": isSelected})}
        onClick={this.handleClick} disabled={username}>
        <div>
          <div className="UserSelection__label">{getColorLabel(color)}, Team {getTeam({color, boardNum})}</div>
          <div className="UserSelection__username">{username}</div>
        </div>
      </button>
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