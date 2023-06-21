import { Timestamp } from "firebase/firestore";

export type ChatRoom = {
  id?: string;
  RoomName: string;
  date: Timestamp;
}

export type Message = {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  date: Timestamp;
  text: string;
  usage?: string;
};

export type EditableMessageState = {
  isTextEditing: boolean;
  isTextSaved: boolean;
};

export type CurrentRoomState = {
  isNewChat: boolean;
  roomId: string;
  roomName: string;
  chatRooms: ChatRoom[];
  currentMessages: Message[];
  userInput: string;
  isNewInputAdded: boolean;
}