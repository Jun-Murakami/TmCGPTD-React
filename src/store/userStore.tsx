// src/store.ts
import { create } from 'zustand';

type State = {
  isLoggedIn: boolean;
  uid: string | null;
  displayName: string | null;
  photoURL: string | undefined;
  logIn: (uid: string, displayName: string, photoURL: string) => void;
  logOut: () => void;
};

export const useUserStore = create<State>((set) => ({
  isLoggedIn: false,
  uid: null,
  displayName: null,
  photoURL: 'https://material-ui.com/static/images/avatar/1.jpg',
  logIn: (uid, displayName, photoURL) => set({ isLoggedIn: true, uid, displayName, photoURL }),
  logOut: () => set({ isLoggedIn: false, uid: null, displayName: null, photoURL: undefined }),
}));
