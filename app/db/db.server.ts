import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { JokeModel, UserModel } from './dbModels';
import { COL_JOKES, COL_USERS } from './collectionNames';

interface GetDbPayloadInterface {
  db: Db;
  client: MongoClient;
}

// create cached connection variable
declare global {
  var __db: GetDbPayloadInterface | undefined;
}

export async function getDatabase(): Promise<GetDbPayloadInterface> {
  // if the database connection is cached, use it instead of creating a new connection
  if (global.__db) {
    return global.__db;
  }

  const uri = process.env.MONGO_URL;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri || !dbName) {
    throw new Error('Unable to connect to database, no URI provided');
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: process.env.MONGO_DB_AUTH_SOURCE,
  };

  // if no connection is cached, create a new one
  const client = await MongoClient.connect(uri, options);

  // select the database through the connection
  const db = await client.db(dbName);

  const payload: GetDbPayloadInterface = {
    db,
    client,
  };

  // cache the database connection and return the connection
  global.__db = payload;
  return payload;
}

interface DbCollectionsPayloadInterface {
  jokesCollection: () => Collection<JokeModel>;
  usersCollection: () => Collection<UserModel>;
}

export async function getDbCollections(): Promise<DbCollectionsPayloadInterface> {
  const { db } = await getDatabase();
  return {
    jokesCollection: () => db.collection<JokeModel>(COL_JOKES),
    usersCollection: () => db.collection<UserModel>(COL_USERS),
  };
}

export const GetObjectId = ObjectId;
