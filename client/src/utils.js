import shortid from 'shortid';

export function generateGameId() {
  // Generate random string for game id
  return shortid.generate();
}

export function getWinningTeam({color, boardNum}) {
  if ((color === 'w' && boardNum === 0) ||
    (color === 'b' && boardNum === 1)) {
    return 1;
  } else {
    return 2;
  }
}