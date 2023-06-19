import { create } from 'zustand';

//----------------------------------------

export type AppState = {
  youonIsChecked: boolean;
  sokuonIsChecked: boolean;
  katakanaIsChecked: boolean;
  englishIsChecked: boolean;
  spaceIsChecked: boolean;
  lyricTextContent: string;
  haWaButtonText: string;
  heEButtonText: string;
  convertedTextContent: string;
  convertSwitch: Record<string, string>;
  convertStockHaWa: string[];
  convertStockHeE: string[];
  setAppState: (key: keyof AppState, value: boolean | string | null | Record<string, string> | string[]) => void;
};

export const useAppStore = create<AppState>()((set) => ({
  youonIsChecked: true,
  sokuonIsChecked: true,
  katakanaIsChecked: true,
  englishIsChecked: true,
  spaceIsChecked: true,
  lyricTextContent: '',
  haWaButtonText: '[は]→わ',
  heEButtonText: '[へ]→え',
  convertedTextContent: '',
  convertSwitch: { "は": "", "へ": "" },
  convertStockHaWa: [],
  convertStockHeE: [],
  setAppState: (key, value) => set((state) => ({ ...state, [key]: value })),
}));

//----------------------------------------

export type AppUiState = {
  drawerIsOpen: boolean;
  setDrawerIsOpen: (drawerIsOpen: boolean) => void;
}

export const useAppUiStore = create<AppUiState>()((set) => ({
  drawerIsOpen: false,
  setDrawerIsOpen: (drawerIsOpen) => set({ drawerIsOpen }),
}));

//----------------------------------------

export type AesKeyState = {
  aesKey: string;
}

export const useAesKeyStore = create<AesKeyState>()((set) => ({
  aesKey: process.env.REACT_APP_SECRET_KEY || '',
}));