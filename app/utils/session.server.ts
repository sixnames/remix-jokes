import bcrypt from 'bcryptjs';
import { getDbCollections } from '../db/db.server';
import { createCookieSessionStorage, redirect } from 'remix';
import { ObjectIdModel, UserModel } from '../db/dbModels';
import { ObjectId } from 'mongodb';

interface LoginForm {
  username: string;
  password: string;
}

export async function register({ username, password }: LoginForm): Promise<UserModel | null> {
  const passwordHash = await bcrypt.hash(password, 10);
  const collections = await getDbCollections();
  const usersCollection = collections.usersCollection();
  const createdUserResult = await usersCollection.insertOne({
    _id: new ObjectId(),
    username,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const user = await usersCollection.findOne({
    _id: createdUserResult.insertedId,
  });
  return user;
}

export async function login({ username, password }: LoginForm) {
  const collections = await getDbCollections();
  const usersCollection = collections.usersCollection();
  const user = await usersCollection.findOne({
    username,
  });
  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) {
    return null;
  }

  return user;
}

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set');
}

export const SESSION_COOKIE_NAME = 'session';

const storage = createCookieSessionStorage({
  cookie: {
    name: SESSION_COOKIE_NAME,
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [SESSION_SECRET],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request): Promise<ObjectIdModel | null> {
  const session = await getUserSession(request);
  const userId = session.get('userId');
  if (!userId || typeof userId !== 'string') {
    return null;
  }
  return new ObjectId(userId);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
): Promise<ObjectIdModel> {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUser(request: Request): Promise<UserModel | null> {
  const collections = await getDbCollections();
  const usersCollection = collections.usersCollection();
  const userId = await getUserId(request);
  if (!userId) {
    return null;
  }

  try {
    return usersCollection.findOne({
      _id: userId,
    });
  } catch {
    throw await logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get('Cookie'));
  return redirect('/login', {
    headers: {
      'Set-Cookie': await storage.destroySession(session),
    },
  });
}

export async function createUserSession(userId: ObjectIdModel, redirectTo: string) {
  const session = await storage.getSession();
  session.set('userId', userId.toHexString());

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
}
