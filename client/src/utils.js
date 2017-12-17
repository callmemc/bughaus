import shortid from 'shortid';

export function generateGameId() {
  // Generate random string for game id
  return shortid.generate();
}