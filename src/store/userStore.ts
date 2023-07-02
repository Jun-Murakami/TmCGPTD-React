// src\store\userStore.ts
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

type State = {
  session: Session | null;
  uuid: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  apiKey: string | null;
  setSession: (session: Session | null) => void;
  setUserInfo: (uuid: string | null, nickname: string | null, avatarUrl: string | null) => void;
  setApiKey: (apiKey: string) => void;
};

export const useUserStore = create<State>((set) => ({
  session: null,
  uuid: null,
  nickname: null,
  avatarUrl: null,
  apiKey: null,
  setSession: (session) => set({ session }),
  setUserInfo: (uuid, nickname, avatarUrl) => set({ uuid, nickname, avatarUrl }),
  setApiKey: (apiKey: string) => set({ apiKey }),
}));
