import { Collection } from 'mongodb';
import { JokeModel, UserModel } from './dbModels';
import { COL_JOKES, COL_USERS } from './collectionNames';
import { getDatabase } from './db.server';

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
