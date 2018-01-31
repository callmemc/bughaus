import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { generateGameId } from './utils';
import FlatButton from 'material-ui/FlatButton';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 50px;
  text-align: center;
`;

const IntroText = styled.p`
  font-size: 1.2rem;
`;

const IntroDesc = styled.p`
  a {
    text-decoration: inherit;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

class HomePage extends Component {
  render() {
    // TODO: Use themes for colors. See http://www.material-ui.com/#/customization/themes
    return (
      <Container>
        <div>
          <IntroText>
            Welcome to <b>Bughaus</b>!
          </IntroText>
          <IntroDesc>
            Here you can play&nbsp;
            <a href='https://en.wikipedia.org/wiki/Bughouse_chess' target="_blank">bughouse chess</a> with your friends.
            What are you waiting for?
          </IntroDesc>
        </div>
        <ButtonContainer>
          <FlatButton
            className="GameButton"
            label="Create a game!"
            backgroundColor="#a4c639"
            hoverColor="#8AA62F"
            labelStyle={{color: 'white', fontSize: '20px'}}
            style={{height: '60px'}}
            onClick={this.createGame} />
        </ButtonContainer>
      </Container>
    );
  }

  createGame = (gameType) => {
    const gameId = generateGameId();

    return fetch(`/api/game`, {
      method: 'POST',
      body: JSON.stringify({ gameId }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).then(() => {
      this.props.history.push(`/game/${gameId}`)
    }).catch((error) => {
      console.error(error);
    });

  }
}

export default withRouter(HomePage);