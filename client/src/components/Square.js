import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import styled from 'styled-components';
import dropTarget from '../utils/dropTarget';
import { red200, red400 } from 'material-ui/styles/colors';

const SquareContainer = styled.div`
  display: flex;
  width: 48px;
  height: 48px;
  box-sizing: border-box;  /* collapse borders */
  cursor: pointer;

  ${props => props.squareColor === 'light' && `
    background-color: #eee;
  `}

  ${props => props.squareColor === 'dark' && `
    background-color: #917156;
  `}

  ${props => props.isActive && `
    background-color: #25ab25;
  `}

  ${props => props.isCurrSquare && props.squareColor === 'light' && `
    background-color: #feef88;
  `}

  ${props => props.isCurrSquare && props.squareColor === 'dark' && `
    background-color: #c1a535;
  `}

  ${props => props.isDropSquare && props.squareColor === 'light' && `
    background-color: ${red200};
  `}

  ${props => props.isDropSquare && props.squareColor === 'dark' && `
    background-color: ${red400};
  `}

  ${props => props.isValidMove && `
    border: 3px solid #25ab25;
  `}
`;


class Square extends Component {
  static propTypes = {
    isCurrSquare: PropTypes.bool,
    isDropSquare: PropTypes.bool,
    isValidMove: PropTypes.bool,
    isActive: PropTypes.bool,
    isChecked: PropTypes.bool
  }

  render() {
    return this.props.connectDropTarget(
      <div>
        <SquareContainer
          {...this.props}
          onMouseDown={this.props.onSelect} />
      </div>
    );
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget()
  };
}

export default DropTarget('PIECE', dropTarget, collect)(Square);