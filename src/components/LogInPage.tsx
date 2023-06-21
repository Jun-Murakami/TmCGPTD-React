// LoginPage.tsx
import React, { useEffect } from 'react';
import { Button, Box } from '@mui/material';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, User } from 'firebase/auth';
import { useUserStore } from '../store/userStore';
import { useDialogStore } from '../store/dialogStore';

export function LogInPage() {
  const showDialog = useDialogStore((state) => state.showDialog);

  function isMobileDevice() {
    return typeof window.orientation !== 'undefined' || navigator.userAgent.indexOf('IEMobile') !== -1;
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      if (isMobileDevice()) {
        // For mobile devices, use popup authentication.
        await signInWithPopup(auth, provider);
      } else {
        // For non-mobile devices (likely desktop), use redirect authentication.
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      await showDialog('Failed to sign in with Google: ' + error, 'Error');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const authenticate = async () => {
      try {
        const user: User | null = await new Promise((resolve) => {
          auth.onAuthStateChanged((user) => {
            if (user) resolve(user);
          });
        });

        if (!user) throw new Error('No result.');
        const { uid, displayName, photoURL } = user;
        useUserStore.getState().logIn(uid, displayName || '', photoURL || '');
      } catch (error) {
        if (isMounted) await showDialog('' + error, 'Error');
      }
    };

    authenticate();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box display='flex' justifyContent='center' alignItems='center' width='100%' height='100vh'>
      <Button onClick={signInWithGoogle} variant='contained'>
        Sign In with Google
      </Button>
    </Box>
  );
}
