import { useEffect } from 'react';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useUserStore } from '../store/userStore';

export const supabase: SupabaseClient = createClient(
  process.env.REACT_APP_SUPABASE_URL || '',
  process.env.REACT_APP_SUPABASE_ANON_KEY || ''
);

export function useSupabaseSession() {
  const session = useUserStore((state) => state.session);
  const setSession = useUserStore((state) => state.setSession);
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        console.log(session);
        const uuid = session.user?.id || null;
        const email = session.user?.email || null;
        const nickname = session.user?.user_metadata?.name || null;
        const avatarUrl = session.user?.user_metadata?.avatar_url || null;
        setUserInfo(uuid, email, nickname, avatarUrl);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      if (session) {
        const uuid = session.user?.id || null;
        const email = session.user?.user_metadata?.email || null;
        const nickname = session.user?.user_metadata?.name || null;
        const avatarUrl = session.user?.user_metadata?.avatar_url || null;
        setUserInfo(uuid, email, nickname, avatarUrl);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
