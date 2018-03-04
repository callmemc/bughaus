import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import UsernameInput from './UsernameInput';
import PlayerSelection from './PlayerSelection';

const dialogStyle = {textAlign: 'center'};

class PlayerSelectionDialog extends Component {
  static propTypes = {
    wPlayer0: PropTypes.string,
    bPlayer0: PropTypes.string,
    wPlayer1: PropTypes.string,
    bPlayer1: PropTypes.string,
    onSelectPlayer: PropTypes.func.isRequired,
    username: PropTypes.string
  }

  render() {
    const { username, connections } = this.props;

    let displayedContent;
    if (!username) {
      displayedContent = (
        <UsernameInput
          onClickNext={this.props.onSetUsername} />
      );
    } else {
      displayedContent = (
        <PlayerSelection
          connections={connections}
          username={username}
          wPlayer0={this.props.wPlayer0}
          bPlayer0={this.props.bPlayer0}
          wPlayer1={this.props.wPlayer1}
          bPlayer1={this.props.bPlayer1}
          onSelectPlayer={this.props.onSelectPlayer}
          onDeselectPlayer={this.props.onDeselectPlayer} />
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