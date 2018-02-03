import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { generateGameId } from './utils';
import FlatButton from 'material-ui/FlatButton';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  margin: auto;
`;

const IntroDesc = styled.p`
  a {
    text-decoration: inherit;
    font-style: italic;
  }
`;

const ButtonContainer = styled.div`
  margin: 20px 0 50px;
`;

class HomePage extends Component {
  render() {
    // TODO: Use themes for colors. See http://www.material-ui.com/#/customization/themes
    return (
      <Container>
        <div>
          <p>Four players.</p> <p>Two boards.</p> <p>One objective: <i>Checkmate.</i></p>
          <IntroDesc>
            This is&nbsp;
            <a href='https://en.wikipedia.org/wiki/Bughouse_chess' target="_blank" rel="noopener noreferrer">
              Bughouse Chess</a>, a thrilling variation of your favorite board game!
          </IntroDesc>
          <img src='https://upload.wikimedia.org/wikipedia/commons/c/c9/Bughouse_game_animation.gif' alt="Bughouse Chess gif" />
        </div>
        <ButtonContainer>
          <FlatButton
            className="GameButton"
            label="Create a game"
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