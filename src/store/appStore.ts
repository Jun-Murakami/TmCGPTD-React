import { create } from 'zustand';

//----------------------------------------

export type AppState = {
  drawerIsOpen: boolean;
  isNewChat: boolean;
  apiModel: string;
  setDrawerIsOpen: (drawerIsOpen: boolean) => void;
  setIsNewChat: (isNewChat: boolean) => void;
  setApiModel: (apiModel: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  drawerIsOpen: false,
  isNewChat: true,
  apiModel: 'gpt-3.5-turbo',
  setDrawerIsOpen: (drawerIsOpen) => set({ drawerIsOpen }),
  setIsNewChat: (isNewChat) => set({ isNewChat }),
  setApiModel: (apiModel) => set({ apiModel }),
}));

//----------------------------------------

export type AesKeyState = {
  aesKey: string;
}

export const useAesKeyStore = create<AesKeyState>()((set) => ({
  aesKey: process.env.REACT_APP_SECRET_KEY || '',
}));