// src/store.ts
import { create } from 'zustand';

type State = {
  isLoggedIn: boolean;
  uid: string | null;
  displayName: string | null;
  photoURL: string | undefined;
  apiKey: string | null;
  logIn: (uid: string, displayName: string, photoURL: string) => void;
  logOut: () => void;
  setApiKey: (apiKey: string) => void;
};

export const useUserStore = create<State>((set) => ({
  isLoggedIn: false,
  uid: null,
  displayName: null,
  photoURL: undefined,
  apiKey: null,
  logIn: (uid, displayName, photoURL) => set({ isLoggedIn: true, uid, displayName, photoURL }),
  logOut: () => set({ isLoggedIn: false, uid: null, displayName: null, photoURL: undefined }),
  setApiKey: (apiKey: string) => set({ apiKey }),
}));
