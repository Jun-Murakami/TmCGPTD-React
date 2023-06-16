// src/components/SignIn.tsx
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@mui/material";
import { auth } from '../firebase';

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <Button onClick={signInWithGoogle} variant="outlined">Sign in with Google</Button>
  );
};

export default SignIn;
