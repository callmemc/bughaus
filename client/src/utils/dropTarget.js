export default {
  canDrop: (props, monitor) => {
    const item = monitor.getItem();

    // Disallow dropping of pieces from one board to the next
    if (item.boardNum !== props.boardNum) {
      return false;
    }

    // Disallow dropping of pieces on other pieces
    // TODO: Reconcile this validation with that in onSelectSquare (!existingPiece)
    //  Having separate validations for dragging vs. clicking squares is confusing
    if (!item.square) {
      return !props.pieceType;
    }

    return true;
  },

  drop: (props, monitor, component) => {
    const item = monitor.getItem();
    if (item.square) {
      props.onDropPiece({
        from: item.square,
        to: props.square
      });
    } else {
      props.onDropPieceFromReserve({
        index: item.index,
        type: item.type,
        color: item.color,
        to: props.square
      })
    }
  }
};