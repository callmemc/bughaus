// TODO: create Timer object, which will serve as closure per game, so don't
//  have to store gameId-keyed objects below

// TODO: Need to reinitiate these if server crashes
const turns = {};
const timers = {};
const DEFAULT_TIME = 600; // 600 sec = 10 min

export function startTimer(gameId, emitTime, endGame) {
  const counters = [
    {
      w: DEFAULT_TIME,
      b: DEFAULT_TIME
    },
    {
      w: DEFAULT_TIME,
      b: DEFAULT_TIME
    }
  ];

  turns[gameId] = ['w', 'w'];

  const timer = setInterval(() => {
    emitTime({ counters0: counters[0], counters1: counters[1] });

    const currentTurns = turns[gameId];

    [0, 1].forEach((boardNum) => {
      const turn = currentTurns[boardNum];

      // Decrease seconds counter
      // TODO: Fix undefined error
      const counter = counters[boardNum][turn]--;

      // If reaches 0
      if (counter <= 0) {
        // Update winner object { color: moveColor, boardNum } and return
        const winningColor = turn === 'w' ? 'b' : 'w';
        endGame({ boardNum, color: winningColor });

        // Stop timer
        clearInterval(timer);
      }
    });
  }, 1000);

  timers[gameId] = timer;
}

export function endTimer(gameId) {
  clearInterval(timers[gameId]);
}

export function updateTurn(gameId, boardNum, nextTurn) {
  // TODO: Fix undefined error
  turns[gameId][boardNum] = nextTurn;
}