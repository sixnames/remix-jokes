import * as React from 'react';
import { JokeModel } from '../../db/dbModels';
import { Link, LoaderFunction, useLoaderData } from 'remix';
import { getDbCollections } from '../../db/db.server';

type LoaderData = { randomJoke?: JokeModel };

export const loader: LoaderFunction = async () => {
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const count = await jokesCollection.countDocuments();
  const randomNumber = Math.floor(Math.random() * count);

  const [randomJoke] = await jokesCollection
    .find(
      {},
      {
        limit: 1,
        skip: randomNumber,
      },
    )
    .toArray();

  return {
    randomJoke,
  };
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's a random joke:</p>
      {data.randomJoke ? (
        <React.Fragment>
          <p>{data.randomJoke.content}</p>
          <Link to={`${data.randomJoke._id}`}>"{data.randomJoke.name}" Permalink</Link>
        </React.Fragment>
      ) : (
        <p>No jokes for you</p>
      )}
    </div>
  );
}
