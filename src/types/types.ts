export type ChatRoom = {
  id?: number;
  date: Date;
  roomName: string;
  category?: string;
  lastPrompt?: string;
  json?: Chat[];
  jsonPrev?: Chat[];
};

export type Message = {
  id?: number;
  role: 'function' | 'assistant' | 'system' | 'user';
  date: Date;
  content: string;
  usage: string;
};

export type EditableMessageState = {
  isTextEditing: boolean;
  isTextSaved: boolean;
};

export type CurrentRoomState = {
  isNewChat: boolean;
  roomId: number;
  roomName: string;
  chatRooms: ChatRoom[];
  currentMessages: Message[];
  userInput: string;
  isNewInputAdded: boolean;
};

export type Chat = {
  role: 'function' | 'assistant' | 'system' | 'user';
  content: string;
};
