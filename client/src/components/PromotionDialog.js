import Dialog from 'material-ui/Dialog';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PieceImage from './PieceImage';

class PromotionDialog extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    onSelectPromotion: PropTypes.func.isRequired,
    pieces: PropTypes.array.isRequired
  };

  render() {
    return (
      <Dialog open={true} contentStyle={{maxWidth: '400px'}}>
        <div className="Promotion">
          {this.props.pieces.map(piece =>
            <div key={piece}
              className="Piece"
              onClick={() => this.handleClick(piece)}>
              <PieceImage color={this.props.color} type={piece} />
            </div>
          )}
        </div>
      </Dialog>
    );
  }

  handleClick = (piece) => {
    this.props.onSelectPromotion(piece);
  }
}

export default PromotionDialog;