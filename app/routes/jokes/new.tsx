import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useCatch,
  useTransition,
} from 'remix';
import { getDbCollections, GetObjectId } from '../../db/db.server';
import { getFormDataStringField } from '../../utils/formDataUtils';
import { validateStringField } from '../../utils/validation';
import { getUserId, requireUserId } from '../../utils/session.server';
import { JokeDisplay } from '../../components/joke';

interface ActionData {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
}

function getFieldErrors(name: string, content: string) {
  return {
    name: validateStringField({
      value: name,
      minLength: 2,
      message: `That joke's name is too short`,
    }),
    content: validateStringField({
      value: content,
      minLength: 10,
      message: `That joke is too short`,
    }),
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return {};
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const formData = await request.formData();
  const name = getFormDataStringField({
    formData,
    fieldName: 'name',
  });
  const content = getFormDataStringField({
    formData,
    fieldName: 'content',
  });

  // validate input
  const fieldErrors = getFieldErrors(name, content);
  const fields = {
    name,
    content,
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    const errorData: ActionData = {
      fieldErrors,
      fields,
    };
    return json(errorData, { status: 400 });
  }

  // create
  const createdJokeResult = await jokesCollection.insertOne({
    _id: new GetObjectId(),
    ...fields,
    jokesterId: userId,
    updatedAt: new Date(),
    createdAt: new Date(),
  });
  const createdJoke = await jokesCollection.findOne({
    _id: createdJokeResult.insertedId,
  });
  if (!createdJokeResult.acknowledged || !createdJoke) {
    const errorData: ActionData = {
      fields,
      formError: 'Joke create error',
    };
    return json(errorData, { status: 400 });
  }

  return redirect(`/jokes/${createdJoke._id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission) {
    const formData = transition.submission.formData;
    const name = getFormDataStringField({
      fieldName: 'name',
      formData,
    });
    const content = getFormDataStringField({
      fieldName: 'content',
      formData,
    });
    const fieldErrors = getFieldErrors(name, content);

    if (!fieldErrors.content && !fieldErrors.name) {
      return <JokeDisplay joke={{ name, content }} isOwner={true} canDelete={false} />;
    }
  }

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method='post'>
        <div>
          <label>
            Name:{' '}
            <input
              type='text'
              defaultValue={actionData?.fields?.name}
              name='name'
              aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
              aria-describedby={actionData?.fieldErrors?.name ? 'name-error' : undefined}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className='form-validation-error' role='alert' id='name-error'>
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{' '}
            <textarea
              defaultValue={actionData?.fields?.content}
              name='content'
              aria-invalid={Boolean(actionData?.fieldErrors?.content) || undefined}
              aria-describedby={actionData?.fieldErrors?.content ? 'content-error' : undefined}
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p className='form-validation-error' role='alert' id='content-error'>
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>

        {actionData?.formError ? (
          <p className='form-validation-error' role='alert' id='form-error'>
            {actionData.formError}
          </p>
        ) : null}

        <div>
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className='error-container'>
        <p>You must be logged in to create a joke.</p>
        <Link to='/login'>Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary() {
  return <div className='error-container'>Something unexpected went wrong. Sorry about that.</div>;
}
