const DEFAULT_TIME = 600; // 600 sec = 10 min


export default class Timer {
  constructor() {
    this.counters = [
      {
        w: DEFAULT_TIME,
        b: DEFAULT_TIME
      },
      {
        w: DEFAULT_TIME,
        b: DEFAULT_TIME
      }
    ];

    this.turns = ['w', 'w'];
  }

  startTimer(emitTime, endGame) {
    this.timer = setInterval(() => {
      emitTime(this.counters);

      [0, 1].forEach((boardNum) => {
        const turn = this.turns[boardNum];

        // Decrease seconds counter
        const counter = this.counters[boardNum][turn]--;

        // If reaches 0
        if (counter <= 0) {
          // Update winner
          const winner = {
            boardNum,
            color: turn === 'w' ? 'b' : 'w'
          };
          endGame(winner);

          // Stop timer
          clearInterval(this.timer);
        }
      });
    }, 1000);
  }

  endTimer() {
    clearInterval(this.timer);
  }

  updateTurn(boardNum, nextTurn) {
    this.turns[boardNum] = nextTurn;
  }
}
