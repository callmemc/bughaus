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
      from: 'a2',
      to: 'a3'
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
        from: 'e4',
        to: 'a3',
        captured: 'p'
      }
    );

    expect(NEW_BOARD_POSITIONS).toEqual(
      [
        {
          "key": "a2",
          "square": null,
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
  const EXPECTED_CAPTURE_RESULT = [
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
  ];

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
        to: 'c5',
        droppedPiece: 'b',
        color: 'w'
      }
    );

    expect(NEW_BOARD_POSITIONS).toEqual(
      EXPECTED_CAPTURE_RESULT
    );
  });

  describe('and capturing a piece with the dropped piece', () => {
    expect(
      getNewBoard(
        EXPECTED_CAPTURE_RESULT,
        {
          from: 'c5',
          to: 'a3',
          captured: 'p'
        }
      )
    ).toEqual(
      [
        {
          "key": "a2",
          "square": null,
          "piece": null,
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
          "square": "a3",
          "piece": "b",
          "color": "w"
        }
      ]
    );
  });
});

