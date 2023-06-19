// LoginPage.tsx
import React, { useEffect } from 'react';
import { Button, Box } from "@mui/material";
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { useUserStore } from '../store/userStore';
import { useDialogStore } from '../store/dialogStore';

export function LogInPage() {
  const showDialog = useDialogStore((state) => state.showDialog);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      await showDialog('Failed to sign in with Google: ' + error, 'Error', true);
    }
  };

  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (!result) return;
        const user = result.user;
        if (user) {
          const { uid, displayName, photoURL } = user;
          useUserStore.getState().logIn(uid, displayName || '', photoURL || '');
        }
      })
      .catch((error) => {
        showDialog('Failed to sign in with Google: ' + error, 'Error', true);
      });
  },[showDialog]);

  return (
    <Box display='flex' justifyContent='center' alignItems='center' width='100%' height='100vh'>
      <Button onClick={signInWithGoogle} variant='contained'>Sign In with Google</Button>
    </Box>
  );
}
