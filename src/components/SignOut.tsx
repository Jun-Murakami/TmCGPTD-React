// src/components/SignOutButton.tsx
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export function SignOutButton() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <button onClick={handleSignOut}>Sign Out</button>
  );
};

