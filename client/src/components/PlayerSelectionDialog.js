import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import UsernameInput from './UsernameInput';
import PlayerSelection from './PlayerSelection';

const dialogStyle = {textAlign: 'center'};

class PlayerSelectionDialog extends Component {
  static propTypes = {
    wUserId0: PropTypes.string,
    bUserId0: PropTypes.string,
    wUserId1: PropTypes.string,
    bUserId1: PropTypes.string,
    onSelectPlayer: PropTypes.func.isRequired,
    username: PropTypes.string
  }

  render() {
    const { username } = this.props;

    let displayedContent;
    if (!username) {
      displayedContent = (
        <UsernameInput
          onClickNext={this.props.onCreateUsername}
          username={this.props.username} />
      );
    } else {
      displayedContent = (
        <PlayerSelection
          username={username}
          wUserId0={this.props.wUserId0}
          bUserId0={this.props.bUserId0}
          wUserId1={this.props.wUserId1}
          bUserId1={this.props.bUserId1}
          onSelectPlayer={this.props.onSelectPlayer} />
      );
    }

    return (
      <Dialog open={true} style={dialogStyle}>
        {displayedContent}
      </Dialog>
    );
  }
}

export default PlayerSelectionDialog;