import { getDatabase, getDbCollections } from './db.server';
import { ObjectId } from 'mongodb';
require('dotenv').config();

(async function seedTestDb() {
  try {
    const { client } = await getDatabase();
    const collections = await getDbCollections();
    const jokesCollection = collections.jokesCollection();
    const usersCollection = collections.usersCollection();

    // seed users
    console.log('seeding users');
    await usersCollection.deleteMany({});

    // this is a hashed version of "twixrox"
    const passwordHash = '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u';
    const jokesterId = new ObjectId();
    await usersCollection.insertOne({
      _id: jokesterId,
      username: 'kody',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // seed jokes
    console.log('seeding jokes');
    await jokesCollection.deleteMany({});
    await jokesCollection.insertMany([
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Road worker',
        content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Frisbee',
        content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Trees',
        content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Skeletons',
        content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Hippos',
        content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Dinner',
        content: `What did one plate say to the other plate? Dinner is on me!`,
      },
      {
        _id: new ObjectId(),
        jokesterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Elevator',
        content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
      },
    ]);
    await client.close();
    return;
  } catch (e) {
    console.log('seedTestDb', e);
    return;
  }
})();
