/*************** MONGODB DATABASE ***************/
import { MongoClient, ObjectId } from 'mongodb';
import assert from 'assert';

// Connection URL
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database name
const dbName = 'bughaus';

let db;

// TODO: Perhaps privatize this
export default db;

export function connectClient() {
  // Connect to a running mongodb deployment
  return MongoClient.connect(uri).then((client) => {
      console.log("** Connected successfully to mongo server **");

      db = client.db(dbName);
      return db;

      // TODO: when do you do this?
      // client.close();
    }).catch((error) => {
      console.error(error);
    });
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const INITIAL_PIECES = [
  { key: 'a1', square: 'a1', piece: 'r', color: 'w' },
  { key: 'b1', square: 'b1', piece: 'n', color: 'w' },
  { key: 'c1', square: 'c1', piece: 'b', color: 'w' },
  { key: 'd1', square: 'd1', piece: 'q', color: 'w' },
  { key: 'e1', square: 'e1', piece: 'k', color: 'w' },
  { key: 'f1', square: 'f1', piece: 'b', color: 'w' },
  { key: 'g1', square: 'g1', piece: 'n', color: 'w' },
  { key: 'h1', square: 'h1', piece: 'r', color: 'w' },
  { key: 'a2', square: 'a2', piece: 'p', color: 'w' },
  { key: 'b2', square: 'b2', piece: 'p', color: 'w' },
  { key: 'c2', square: 'c2', piece: 'p', color: 'w' },
  { key: 'd2', square: 'd2', piece: 'p', color: 'w' },
  { key: 'e2', square: 'e2', piece: 'p', color: 'w' },
  { key: 'f2', square: 'f2', piece: 'p', color: 'w' },
  { key: 'g2', square: 'g2', piece: 'p', color: 'w' },
  { key: 'h2', square: 'h2', piece: 'p', color: 'w' },
  { key: 'a7', square: 'a7', piece: 'p', color: 'b' },
  { key: 'b7', square: 'b7', piece: 'p', color: 'b' },
  { key: 'c7', square: 'c7', piece: 'p', color: 'b' },
  { key: 'd7', square: 'd7', piece: 'p', color: 'b' },
  { key: 'e7', square: 'e7', piece: 'p', color: 'b' },
  { key: 'f7', square: 'f7', piece: 'p', color: 'b' },
  { key: 'g7', square: 'g7', piece: 'p', color: 'b' },
  { key: 'h7', square: 'h7', piece: 'p', color: 'b' },
  { key: 'a8', square: 'a8', piece: 'r', color: 'b' },
  { key: 'b8', square: 'b8', piece: 'n', color: 'b' },
  { key: 'c8', square: 'c8', piece: 'b', color: 'b' },
  { key: 'd8', square: 'd8', piece: 'q', color: 'b' },
  { key: 'e8', square: 'e8', piece: 'k', color: 'b' },
  { key: 'f8', square: 'f8', piece: 'b', color: 'b' },
  { key: 'g8', square: 'g8', piece: 'n', color: 'b' },
  { key: 'h8', square: 'h8', piece: 'r', color: 'b' }
];
const INITIAL_POSITION = {
  fen: INITIAL_FEN,
  wReserve: '',
  bReserve: '',
  piecePositions: INITIAL_PIECES
};
const INITIAL_GAME = {
  fen0: INITIAL_FEN,
  wReserve0: '',
  bReserve0: '',
  history0: [INITIAL_POSITION],
  pieces0: INITIAL_PIECES,
  fen1: INITIAL_FEN,
  wReserve1: '',
  bReserve1: '',
  history1: [INITIAL_POSITION],
  pieces1: INITIAL_PIECES
};

export function createGame(gameId) {
  const collection = db.collection('games');
  // Returns a promise if no callback is called
  return collection.insertOne({ _id: gameId, ...INITIAL_GAME });
}

export function getGame(gameId) {
  const collection = db.collection('games');
  return collection.findOne({ '_id': gameId });
}

export function updateGame(gameId, data) {
  const collection = db.collection('games');
  return collection.updateOne({ '_id': gameId }, { '$set': data });
}