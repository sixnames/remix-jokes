import type { LoaderFunction } from 'remix';
import { Outlet, Link, useLoaderData, Form } from 'remix';
import { getDbCollections } from '../db/db.server';
import { UserModel } from '../db/dbModels';
import { getUser } from '../utils/session.server';

type LoaderData = {
  user: UserModel | null;
  jokeListItems: Array<{ _id: string; name: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const jokes = await jokesCollection
    .find(
      {},
      {
        projection: {
          _id: true,
          name: true,
        },
        limit: 5,
        sort: {
          _id: -1,
        },
      },
    )
    .toArray();

  const user = await getUser(request);

  const data: LoaderData = {
    user,
    jokeListItems: jokes.map(({ _id, name }) => {
      return {
        _id: _id.toHexString(),
        name,
      };
    }),
  };
  return data;
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Remix Jokes' aria-label='Remix Jokes'>
              <span className='logo'>🤪</span>
              <span className='logo-medium'>J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className='user-info'>
              <span>{`Hi ${data.user.username}`}</span>
              <Form action='/logout' method='post'>
                <button type='submit' className='button'>
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to='/login'>Login</Link>
          )}
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container'>
          <div className='jokes-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map((joke) => (
                <li key={joke._id}>
                  <Link prefetch={'intent'} to={joke._id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to='new' className='button'>
              Add your own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
