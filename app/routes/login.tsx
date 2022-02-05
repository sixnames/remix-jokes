import type { ActionFunction, LinksFunction } from 'remix';
import { useActionData, json, Link, useSearchParams } from 'remix';
import stylesUrl from '../styles/login.css';
import { getFormDataStringField } from '../utils/formDataUtils';
import { validateStringField } from '../utils/validation';
import { getDbCollections } from '../db/db.server';
import { createUserSession, login, register } from '../utils/session.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const collections = await getDbCollections();
  const usersCollection = collections.usersCollection();
  const formData = await request.formData();
  const loginType = getFormDataStringField({
    formData,
    fieldName: 'loginType',
  });
  const username = getFormDataStringField({
    formData,
    fieldName: 'username',
  });
  const password = getFormDataStringField({
    formData,
    fieldName: 'password',
  });
  const redirectTo =
    getFormDataStringField({
      formData,
      fieldName: 'redirectTo',
    }) || '/jokes';

  const fields = {
    loginType,
    username,
    password,
  };
  const fieldErrors = {
    username: validateStringField({
      value: username,
      minLength: 3,
      message: 'Usernames must be at least 3 characters long',
    }),
    password: validateStringField({
      value: password,
      minLength: 6,
      message: 'Passwords must be at least 6 characters long',
    }),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  if (loginType === 'login') {
    // login to get the user
    const user = await login({ username, password });

    // if there's no user, return the fields and a formError
    if (!user) {
      return badRequest({
        fields,
        formError: `Username/Password combination is incorrect`,
      });
    }

    // if there is a user, create their session and redirect to /jokes
    return createUserSession(user._id, redirectTo);
  }

  if (loginType === 'register') {
    const userExists = await usersCollection.findOne({
      username,
    });
    if (userExists) {
      return badRequest({
        fields,
        formError: `User with username ${username} already exists`,
      });
    }
    // create the user
    const user = await register({ username, password });
    if (!user) {
      return badRequest({
        fields,
        formError: `Something went wrong trying to create a new user.`,
      });
    }

    // create their session and redirect to /jokes
    return createUserSession(user._id, redirectTo);
  }

  return badRequest({
    fields,
    formError: `Login type invalid`,
  });
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <div className='container'>
      <div className='content' data-light=''>
        <h1>Login</h1>
        <form
          method='post'
          aria-describedby={actionData?.formError ? 'form-error-message' : undefined}
        >
          <input
            type='hidden'
            name='redirectTo'
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset>
            <legend className='sr-only'>Login or Register?</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType || actionData?.fields?.loginType === 'login'
                }
              />{' '}
              Login
            </label>
            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />{' '}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor='username-input'>Username</label>
            <input
              type='text'
              id='username-input'
              name='username'
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-describedby={actionData?.fieldErrors?.username ? 'username-error' : undefined}
            />
            {actionData?.fieldErrors?.username ? (
              <p className='form-validation-error' role='alert' id='username-error'>
                {actionData?.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor='password-input'>Password</label>
            <input
              id='password-input'
              name='password'
              defaultValue={actionData?.fields?.password}
              type='password'
              aria-invalid={Boolean(actionData?.fieldErrors?.password) || undefined}
              aria-describedby={actionData?.fieldErrors?.password ? 'password-error' : undefined}
            />
            {actionData?.fieldErrors?.password ? (
              <p className='form-validation-error' role='alert' id='password-error'>
                {actionData?.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id='form-error-message'>
            {actionData?.formError ? (
              <p className='form-validation-error' role='alert'>
                {actionData?.formError}
              </p>
            ) : null}
          </div>
          <button type='submit' className='button'>
            Submit
          </button>
        </form>
      </div>
      <div className='links'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/jokes'>Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
