import { Timestamp } from "firebase/firestore";

export type Message = {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  date: Timestamp;
  text: string;
  usage?: string;
};