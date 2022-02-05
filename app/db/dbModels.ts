import { ObjectId } from 'mongodb';

export type DateModel = Date;
export type ObjectIdModel = ObjectId;

export interface TimeStampInterface {
  createdAt: DateModel;
  updatedAt: DateModel;
}

export interface JokeModel extends TimeStampInterface {
  _id: ObjectIdModel;
  name: string;
  content: string;
  jokesterId: ObjectIdModel;
}

export interface UserModel extends TimeStampInterface {
  _id: ObjectIdModel;
  username: string;
  passwordHash: string;
}
