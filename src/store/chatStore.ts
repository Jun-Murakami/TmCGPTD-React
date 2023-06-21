import { create } from 'zustand';
import { produce } from 'immer';
import { getMessagesDb } from '../services/firestore';
import { Message, ChatRoom } from '../types/types';

type RoomState = {
  isNewChat: boolean;
  chatRooms: ChatRoom[];
  currentRoomId?: string;
  currentRoomName?: string;
  systemMessage?: string;
  systemMessageId?: string;
  lastUserMessage?: string;
  lastUserMessageId?: string;
  lastAssistantMessage?: string;
  lastAssistantMessageId?: string;
  userInput: string;
  isNewInputAdded: boolean;
};

export type ChatStore = {
  roomState: RoomState;
  currentMessages: Message[];
  setRoomState: (newState: Partial<RoomState> | ((prevState: RoomState) => RoomState)) => void;
  setCurrentMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void;
  getMessages: (userId: string, roomId: string) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set) => ({
  roomState: {
    isNewChat: true,
    chatRooms: [],
    currentRoomId: '',
    currentRoomName: '',
    systemMessage: '',
    systemMessageId: '',
    lastUserMessage: '',
    lastUserMessageId: '',
    lastAssistantMessage: '',
    lastAssistantMessageId: '',
    userInput: '',
    isNewInputAdded: false,
  },
  currentMessages: [],
  setRoomState: (newState) =>
    set((state) => produce(state, (draftState) => {
      if (typeof newState === 'function') {
        draftState.roomState = newState(draftState.roomState);
      } else {
        draftState.roomState = { ...draftState.roomState, ...newState };
      }
    })),
  setCurrentMessages: (messages) =>
    set((state) => produce(state, (draftState) => {
      if (typeof messages === 'function') {
        draftState.currentMessages = messages(draftState.currentMessages);
      } else {
        draftState.currentMessages = messages;
      }
    })),
  getMessages: async (userId, roomId) => {
    const messages = await getMessagesDb(userId, roomId);
    set((state) => produce(state, (draftState) => {
      draftState.currentMessages = messages;
    }));
  },
}));
