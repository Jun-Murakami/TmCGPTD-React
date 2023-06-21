import { Timestamp } from "firebase/firestore";

export type ChatRoom = {
  id?: string;
  RoomName: string;
  date: Timestamp;
}