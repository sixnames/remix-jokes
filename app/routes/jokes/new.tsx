import { ActionFunction, redirect, json, useActionData } from 'remix';
import { ObjectId } from 'mongodb';
import { getDbCollections } from '../../db/db.server';

function validateJokeContent(content: FormDataEntryValue | null) {
  if (typeof content !== 'string') {
    return `Content field is required`;
  }
  if (content.length < 10) {
    return `That joke is too short`;
  }
}

function validateJokeName(name: FormDataEntryValue | null) {
  if (typeof name !== 'string') {
    return `Name field is required`;
  }
  if (name.length < 2) {
    return `That joke's name is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
    content: string | undefined;
  };
  fields?: {
    name: string;
    content: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const collections = await getDbCollections();
  const jokesCollection = collections.jokesCollection();
  const form = await request.formData();
  const name = form.get('name');
  const content = form.get('content');

  // validate input
  const fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors });
  }

  // create
  const createdJokeResult = await jokesCollection.insertOne({
    _id: new ObjectId(),
    name: `${name}`,
    content: `${content}`,
    updatedAt: new Date(),
    createdAt: new Date(),
  });

  return redirect(`/jokes/${createdJokeResult.insertedId}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method='post'>
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
        <div>
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
