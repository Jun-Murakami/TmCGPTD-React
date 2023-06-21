import { create } from 'zustand';
import { produce } from 'immer';
import { getMessagesDb } from '../services/firestore';
import { Message } from '../types/Message';
import { ChatRoom } from '../types/ChatRoom';

type ChatStore = {
  isNewChat: boolean;
  currentMessages: Message[];
  chatRooms: ChatRoom[];
  currentRoomId?: string;
  userInput: string;
  isNewInputAdded: boolean;
  setIsNewChat: (isNewChat: boolean) => void;
  setCurrentMessages: (messages: Message[] | ((prevMessages: Message[]) => Message[])) => void;
  setChatRooms: (chatRooms: ChatRoom[]) => void;
  setCurrentRoomId: (roomId: string) => void;
  setUserInput: (userInput: string) => void;
  setIsNewInputAdded: (isNewInputAdded: boolean) => void;
  getMessages: (userId: string, roomId: string) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set) => ({
  currentMessages: [],
  isNewChat: true,
  chatRooms: [],
  currentRoomId: undefined,
  userInput: '',
  isNewInputAdded: false,
  setIsNewChat: (isNewChat) => set({ isNewChat }),
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
  setCurrentMessages: (messages) =>
    set((state) => produce(state, (draftState) => {
      if (typeof messages === 'function') {
        draftState.currentMessages = messages(draftState.currentMessages);
      } else {
        draftState.currentMessages = messages;
      }
    })),
  setChatRooms: (chatRooms) =>
    set((state) => produce(state, (draftState) => {
      draftState.chatRooms = chatRooms;
    })),
  getMessages: async (userId, roomId) => {
    const messages = await getMessagesDb(userId, roomId);
    set((state) => produce(state, (draftState) => {
      draftState.currentMessages = messages;
    }));
  },
  setUserInput: (userInput) => set({ userInput }),
  setIsNewInputAdded: (isNewInputAdded) => set({ isNewInputAdded }),
}));