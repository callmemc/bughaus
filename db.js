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
const INITIAL_GAME = {
  fen0: INITIAL_FEN,
  wReserve0: '',
  bReserve0: '',
  fen1: INITIAL_FEN,
  wReserve1: '',
  bReserve1: ''
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