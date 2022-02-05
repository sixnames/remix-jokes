import { JokeModel, UserModel } from './dbModels';

export interface UserInterface extends Partial<UserModel> {
  jokes?: JokeInterface[] | null;
}

export interface JokeInterface extends Partial<JokeModel> {
  jokester?: UserInterface | null;
}
