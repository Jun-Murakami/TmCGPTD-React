import { create } from 'zustand';
import { Message, getMessages } from '../services/firestore';

type ChatStore = {
  isNewChat: boolean;
  CurrentMessages: Message[];
  setIsNewChat: (isNewChat: boolean) => void;
  setCurrentMessages: (messages: Message[]) => void;
  getMessages: (userId: string, roomId: string) => Promise<void>;
};

export const useChatStore = create<ChatStore>((set) => ({
  CurrentMessages: [],
  isNewChat: true,
  setIsNewChat: (isNewChat) => set({ isNewChat }),
  setCurrentMessages: (messages) => set({ CurrentMessages: messages }),
  getMessages: async (userId, roomId) => {
    const messages = await getMessages(userId, roomId);
    set({ CurrentMessages: messages });
  },
}));
