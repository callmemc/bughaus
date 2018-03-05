import getNewBoard from './boardUtil';


describe('moving a piece', () => {
  const NEW_BOARD_POSITIONS = getNewBoard(
    [
      {
        "key": "a2",
        "square": "a2",
        "piece": "p",
        "color": "w"
      },
      {
        "key": "e2",
        "square": "e4",
        "piece": "p",
        "color": "w"
      }
    ],
    {
      move: {
        from: 'a2',
        to: 'a3'
      },
    }
  );

  it('updates the positions', () => {
    expect(NEW_BOARD_POSITIONS).toEqual(
      [
        {
          "key": "a2",
          "square": "a3",
          "piece": "p",
          "color": "w"
        },
        {
          "key": "e2",
          "square": "e4",
          "piece": "p",
          "color": "w"
        }
      ]
    );
  });
});


describe('capturing a piece', () => {
  it('updates the positions', () => {
    const NEW_BOARD_POSITIONS = getNewBoard(
      [
        {
          "key": "a2",
          "square": "a3",
          "piece": "p",
          "color": "w"
        },
        {
          "key": "e2",
          "square": "e4",
          "piece": "p",
          "color": "w"
        }
      ],
      {
        move: {
          from: 'e4',
          to: 'a3'
        },
        capturedSquare: 'a3'
      }
    );

    expect(NEW_BOARD_POSITIONS).toEqual(
      [
        {
          "key": "a2",
          "square": "a3",
          "piece": null,
          "color": "w"
        },
        {
          "key": "e2",
          "square": "a3",
          "piece": "p",
          "color": "w"
        }
      ]
    );
  });
});

describe('dropping a piece', () => {
  it('updates the positions', () => {
    const NEW_BOARD_POSITIONS = getNewBoard(
      [
        {
          "key": "a2",
          "square": "a3",
          "piece": "p",
          "color": "w"
        },
        {
          "key": "e2",
          "square": "e4",
          "piece": "p",
          "color": "w"
        }
      ],
      {
        move: {
          to: 'c5'
        },
        droppedPiece: 'b',
        moveColor: 'w'
      }
    );

    expect(NEW_BOARD_POSITIONS).toEqual(
      [
        {
          "key": "a2",
          "square": "a3",
          "piece": "p",
          "color": "w"
        },
        {
          "key": "e2",
          "square": "e4",
          "piece": "p",
          "color": "w"
        },
        {
          "key": "drop_2",
          "square": "c5",
          "piece": "b",
          "color": "w"
        }
      ]
    );
  });
});

