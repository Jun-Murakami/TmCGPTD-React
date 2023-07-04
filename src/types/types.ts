export type ChatRoom = {
  id?: string;
  date: Date;
  RoomName: string;
  category?: string;
  lastPrompt?: string;
  json?: string;
  jsonprev?: string;
};

export type Message = {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  date: Date;
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
};
