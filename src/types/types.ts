export type ChatRoom = {
  id?: number;
  date: Date;
  roomName: string;
  category?: string;
  lastPrompt?: string;
  json?: string;
  jsonprev?: string;
};

export type Message = {
  id?: number;
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
  roomId: number;
  roomName: string;
  chatRooms: ChatRoom[];
  currentMessages: Message[];
  userInput: string;
  isNewInputAdded: boolean;
};
