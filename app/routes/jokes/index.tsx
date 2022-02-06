import * as React from 'react';
import { JokeModel } from '../../db/dbModels';
import { Link, LoaderFunction, useCatch, useLoaderData } from 'remix';
import { getDbCollections } from '../../db/db.server';
import { JokeInterface } from '../../db/uiInterfaces';

type LoaderData = { randomJoke: JokeInterface };

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

  if (!randomJoke) {
    throw new Response('No random joke found', {
      status: 404,
    });
  }

  return {
    randomJoke,
  };
};

export default function JokesIndexRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
      <Link to={data.randomJoke._id}>"{data.randomJoke.name}" Permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div className='error-container'>There are no jokes to display.</div>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <div className='error-container'>I did a whoopsies.</div>;
}
