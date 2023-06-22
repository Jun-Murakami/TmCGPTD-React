import { create } from 'zustand';

//----------------------------------------

export type AppState = {
  drawerIsOpen: boolean;
  inputText: string;
  apiModel: string;
  setDrawerIsOpen: (drawerIsOpen: boolean) => void;
  setInputText: (inputText: string) => void;
  setApiModel: (apiModel: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  drawerIsOpen: false,
  inputText: '',
  apiModel: 'gpt-3.5-turbo',
  setDrawerIsOpen: (drawerIsOpen) => set({ drawerIsOpen }),
  setInputText: (inputText) => set({ inputText }),
  setApiModel: (apiModel) => set({ apiModel }),
}));

//----------------------------------------

export type AesKeyState = {
  aesKey: string;
}

export const useAesKeyStore = create<AesKeyState>()((set) => ({
  aesKey: process.env.REACT_APP_SECRET_KEY || '',
}));