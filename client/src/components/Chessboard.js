import React, { Component } from 'react';

class Chessboard extends Component {
  render() {
    return (
      <div>
        {this.props.fen}
      </div>
    );
  }
}

export default Chessboard;