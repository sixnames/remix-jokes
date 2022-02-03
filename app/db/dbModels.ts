import { ObjectId } from 'mongodb';

export type DateModel = Date;
export type ObjectIdModel = ObjectId;
export type EmailAddressModel = string;
export type PhoneNumberModel = string;

export interface TimeStampInterface {
  createdAt: DateModel;
  updatedAt: DateModel;
}

export interface JokeModel extends TimeStampInterface {
  _id: ObjectIdModel;
  name: string;
  content: string;
}
