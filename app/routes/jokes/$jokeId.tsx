import { JokeModel } from '../../db/dbModels';
import {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
  redirect,
  useCatch,
  useLoaderData,
  useParams,
} from 'remix';
import { getDbCollections, GetObjectId } from '../../db/db.server';
import { getUserId, requireUserId } from '../../utils/session.server';
import { getFormDataStringField } from '../../utils/formDataUtils';
import { JokeDisplay } from '../../components/joke';

export const meta: MetaFunction = ({ data }: { data: JokeRouteDataInterface | undefined }) => {
  if (!data) {
    return {
      title: 'No joke',
      description: 'No joke found',
    };
  }

  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

export interface JokeRouteDataInterface {
  joke: Pick<JokeModel, 'content' | 'name'>;
  isOwner: boolean;
}

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await getUserId(request);
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const joke = await jokesCollection.findOne({
    _id: new GetObjectId(`${params.jokeId}`),
  });

  if (!joke) {
    throw new Error('Joke not found');
  }

  const data: JokeRouteDataInterface = {
    joke: {
      content: joke.content,
      name: joke.name,
    },
    isOwner: !userId || joke.jokesterId.equals(userId),
  };
  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const method = getFormDataStringField({
    formData,
    fieldName: '_method',
  });
  if (method === 'delete') {
    const userId = await requireUserId(request);
    const jokeId = new GetObjectId(params.jokeId);

    const joke = await jokesCollection.findOne({
      _id: jokeId,
    });

    if (!joke) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }
    if (!joke.jokesterId.equals(userId)) {
      throw new Response("Pssh, nice try. That's not your joke", {
        status: 401,
      });
    }

    await jokesCollection.findOneAndDelete({
      _id: jokeId,
    });
    return redirect('/jokes');
  }
};

export default function JokeRoute() {
  const data = useLoaderData<JokeRouteDataInterface>();

  return <JokeDisplay joke={data.joke} isOwner={data.isOwner} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  switch (caught.status) {
    case 404: {
      return <div className='error-container'>Huh? What the heck is {params.jokeId}?</div>;
    }
    case 401: {
      return <div className='error-container'>Sorry, but {params.jokeId} is not your joke.</div>;
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className='error-container'>{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}
