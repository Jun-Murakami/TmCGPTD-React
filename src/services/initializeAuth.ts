// src/auth.ts
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from '../store/userStore';

export function initializeAuth() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const { uid, displayName, photoURL } = user;
      useUserStore.getState().logIn(uid, displayName || '', photoURL || '');
    } else {
      useUserStore.getState().logOut();
    }
  });
};