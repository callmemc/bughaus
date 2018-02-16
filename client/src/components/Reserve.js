import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Piece from './Piece';

const Container = styled.div`
  display: flex;
  height: 48px;
`;

class Reserve extends Component {
  static propTypes = {
    activeIndex: PropTypes.number,
    color: PropTypes.string.isRequired,
    isSelectable: PropTypes.bool,
    onSelectPiece: PropTypes.func.isRequired,
    queue: PropTypes.string
  }

  render() {
    const queue = this.props.queue || '';

    return (
      <Container>
        {queue.split('').filter(val => val).map((piece, index) => (
          <ReservePiece
            key={index}
            boardNum={this.props.boardNum}
            color={this.props.color}
            index={index}
            isActive={this.props.activeIndex === index}
            isSelectable={this.props.isSelectable}
            onSelect={this.props.onSelectPiece}
            type={piece} />
        ))}
      </Container>
    );
  }
}

const PieceContainer = styled.div`
  ${(props) => props.isActive && `
    background-color: #25ab25;
  `}
`;

class ReservePiece extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isActive: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired
  }

  render() {
    return (
      <PieceContainer isActive={this.props.isActive}>
        <Piece
          boardNum={this.props.boardNum}
          color={this.props.color}
          index={this.props.index}
          onSelect={this.handleSelectPiece}
          isDraggable={this.props.isSelectable}
          pieceType={this.props.type} />
      </PieceContainer>
    );
  }

  handleSelectPiece = () => {
    if (this.props.isSelectable) {
      this.props.onSelect(this.props.index, this.props.color, this.props.type);
    }
  }
}

export default Reserve;