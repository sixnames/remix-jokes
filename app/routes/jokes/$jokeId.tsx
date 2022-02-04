import { JokeModel } from '../../db/dbModels';
import { Link, LoaderFunction, useLoaderData } from 'remix';
import { ObjectId } from 'mongodb';
import { getDbCollections } from '../../db/db.server';

type LoaderData = { joke: JokeModel };

export const loader: LoaderFunction = async ({ params }) => {
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const joke = await jokesCollection.findOne({
    _id: new ObjectId(params.jokeId),
  });

  if (!joke) {
    throw new Error('Joke not found');
  }

  const data: LoaderData = { joke };
  return data;
};

export default function JokeRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{data.joke.content}</p>
      <Link to='.'>{data.joke.name} Permalink</Link>
    </div>
  );
}
