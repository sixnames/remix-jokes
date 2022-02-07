import * as React from 'react';
import { Link, Form } from 'remix';
import { JokeRouteDataInterface } from '../routes/jokes/$jokeId';

interface JokeDisplayInterface extends JokeRouteDataInterface {
  canDelete?: boolean;
}

export const JokeDisplay: React.FC<JokeDisplayInterface> = ({
  joke,
  isOwner,
  canDelete = true,
}) => {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to='.'>{joke.name} Permalink</Link>
      {isOwner ? (
        <Form method='post'>
          <input type='hidden' name='_method' value='delete' />
          <button type='submit' className='button' disabled={!canDelete}>
            Delete
          </button>
        </Form>
      ) : null}
    </div>
  );
};
