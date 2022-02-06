import { JokeModel } from '../../db/dbModels';
import { Link, LoaderFunction, useCatch, useLoaderData, useParams } from 'remix';
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

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return <div className='error-container'>Huh? What the heck is "{params.jokeId}"?</div>;
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className='error-container'>{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
