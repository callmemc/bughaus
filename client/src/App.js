import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import styled from 'styled-components';
import HomePage from './HomePage';
import GamePage from './GamePage';
const src = require('./img/github.png');

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  flex: 1;
`;

const MainContainer = styled.main`
  flex: 1;
  display: flex;
`;

const Title = styled.div`
  a {
    text-decoration: inherit;
    color: inherit;
  }
`;
const LogoContainer = styled.a`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 36px;
  height: 36px;
`;

class PrimaryLayout extends Component {
  render() {
    return (
      <AppContainer>
        <AppBar
          title={<Title><Link to="/">Bughaus</Link></Title>}
          showMenuIconButton={false}
          style={{backgroundColor: '#222'}}>
          <LogoContainer href="https://github.com/callmemc/bughaus" target="_blank">
            <Logo src={src} draggable="false" />
          </LogoContainer>
        </AppBar>
        <MainContainer>
          <Route path ="/" exact component={HomePage}/>
          <Route path ="/game/:gameId" exact component={GamePage}/>
        </MainContainer>
      </AppContainer>
    );
  }
}

const App = () => (
  <MuiThemeProvider>
    <BrowserRouter>
      <PrimaryLayout />
    </BrowserRouter>
  </MuiThemeProvider>
);

export default App;
