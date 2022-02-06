import { JokeModel, UserModel } from './dbModels';

export interface UserInterface extends Partial<Omit<UserModel, '_id'>> {
  _id: string;
  jokes?: JokeInterface[] | null;
}

export interface JokeInterface extends Partial<Omit<JokeModel, '_id'>> {
  _id: string;
  jokester?: UserInterface | null;
}
