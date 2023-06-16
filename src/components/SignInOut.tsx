// src/auth.ts
import { auth } from '../firebase';
import { Button } from "@mui/material";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { useUserStore } from '../store/userStore';
import { useDialogStore } from '../store/dialogStore';

export const initializeAuth = () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const { uid, displayName, photoURL } = user;
      useUserStore.getState().logIn(uid, displayName || '', photoURL || '');
    } else {
      useUserStore.getState().logOut();
    }
  });
};

export function SignInOut()  {
  const showDialog = useDialogStore((state) => state.showDialog);
  const { isLoggedIn, displayName } = useUserStore();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const { uid, displayName, photoURL } = user;
        useUserStore.getState().logIn(uid, displayName || '', photoURL || '');
      }
    } catch (error) {
      await showDialog('Failed to sign in with Google: ' + error, 'Error', true);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    useUserStore.getState().logOut();
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <div>{displayName}</div>
          <Button variant="contained" color="primary" onClick={logOut}>
            Log Out
          </Button>
        </div>
      ) : (
        <Button variant="contained" color="primary" onClick={signInWithGoogle}>
          Sign In with Google
        </Button>
      )}
    </div>
  );
};