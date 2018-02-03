import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

const ButtonContainer = styled.div`
  margin-top: 15px;
  text-align: right;
`;

class UsernameInput extends Component {
  static propTypes = {
    onClickNext: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      username: ''
    };
  }

  render() {
    return (
      <div>
        <TextField
          id="username"
          hintText="Enter username"
          value={this.state.username}
          onChange={this.handleChange} />
          <ButtonContainer>
            <FlatButton
              label="Next"
              backgroundColor="#a4c639"
              hoverColor="#8AA62F"
              labelStyle={{color: 'white'}}
              onClick={this.handleClickNext} />
          </ButtonContainer>
      </div>
    );
  }

  handleChange = (event) => {
    // TODO: Make sure username is unique
    this.setState({ username: event.target.value });
  }

  handleClickNext = () => {
    if (!this.state.username) {
      return;
    }

    this.props.onClickNext(this.state.username);
  }
}

export default UsernameInput