import { getDatabase } from './db.server';
import { JokeModel } from './dbModels';
import { COL_JOKES } from './collectionNames';
import { ObjectId } from 'mongodb';
require('dotenv').config();

(async function seedTestDb() {
  try {
    const { db, client } = await getDatabase();
    const jokesCollection = db.collection<JokeModel>(COL_JOKES);
    await jokesCollection.deleteMany({});
    await jokesCollection.insertMany([
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Road worker',
        content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      },
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Frisbee',
        content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
      },
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Trees',
        content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
      },
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Skeletons',
        content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
      },
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Hippos',
        content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
      },
      {
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Dinner',
        content: `What did one plate say to the other plate? Dinner is on me!`,
      },
      {
        _id: new ObjectId(),
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
