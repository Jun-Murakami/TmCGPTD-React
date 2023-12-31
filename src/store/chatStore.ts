// chatStore.ts
import { create } from 'zustand';
import { produce } from 'immer';
import { getMessagesDb } from '../services/supabaseDb';
import { Message, ChatRoom, Chat } from '../types/types';

export type RoomState = {
  isNewChat: boolean;
  chatRooms: ChatRoom[];
  currentRoomId?: number;
  currentRoomName?: string;
  currentCategory?: string;
  systemMessage?: string;
  systemMessageId?: number;
  lastUserMessage?: string;
  lastUserMessageId?: number;
  lastAssistantMessage?: Message;
  lastAssistantMessageId?: number;
  isAssistantMessageRecievedDone?: boolean;
  json?: Chat[];
  jsonPrev?: Chat[];
  userInput: string;
  isNewInputAdded: boolean;
};

export type ChatStore = {
  roomState: RoomState;
  currentMessages: Message[];
  setRoomState: (newState: Partial<RoomState> | ((prevState: RoomState) => RoomState)) => void;
  setCurrentMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void;
  getMessages: (roomId: number) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set) => ({
  roomState: {
    isNewChat: true,
    chatRooms: [],
    currentRoomId: undefined,
    currentRoomName: '',
    currentCategory: '',
    systemMessage: '',
    systemMessageId: undefined,
    lastUserMessage: '',
    lastUserMessageId: undefined,
    lastAssistantMessage: undefined,
    lastAssistantMessageId: undefined,
    isAssistantMessageRecievedDone: false,
    json: [],
    jsonPrev: [],
    userInput: '',
    isNewInputAdded: false,
  },
  currentMessages: [],
  setRoomState: (newState) =>
    set((state) =>
      produce(state, (draftState) => {
        if (typeof newState === 'function') {
          draftState.roomState = newState(draftState.roomState);
        } else {
          draftState.roomState = { ...draftState.roomState, ...newState };
        }
      })
    ),
  setCurrentMessages: (messages) =>
    set((state) =>
      produce(state, (draftState) => {
        if (typeof messages === 'function') {
          draftState.currentMessages = messages(draftState.currentMessages);
        } else {
          draftState.currentMessages = messages;
        }
      })
    ),
  getMessages: async (roomId) => {
    const messages = await getMessagesDb(roomId);
    set((state) =>
      produce(state, (draftState) => {
        draftState.currentMessages = messages;
      })
    );
  },
}));
