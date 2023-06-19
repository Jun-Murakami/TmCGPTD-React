import { useEffect } from 'react';
import { auth } from './services/firebase';
import { useUserStore } from './store/userStore';
import { LogInPage } from './components/LogInPage';
import { useDialogStore } from './store/dialogStore';
import { useInputDialogStore } from './store/dialogStore';
import { ModalDialog } from './components/ModalDialog';
import { InputDialog } from './components/InputDialog';
import { MainContainer } from './components/MainContainer';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

function App() {
  const isDialogVisible = useDialogStore((state) => state.isDialogVisible);
  const isInputDialogVisible = useInputDialogStore((state) => state.isDialogVisible);
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const logIn = useUserStore((state) => state.logIn);
  const logOut = useUserStore((state) => state.logOut);
  const setApiKey = useUserStore(state => state.setApiKey);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user  => {
      if (user) {
        logIn(user.uid, user.displayName || '', user.photoURL || '');
      } else {
        logOut();
      }
    });
    
    return unsubscribe;
  }, [logIn, logOut]);

  useEffect(() => {
    const openAIKey = localStorage.getItem('encryptedKey');
    if (openAIKey) {
      const decyptedKey = AES.decrypt(openAIKey, process.env.REACT_APP_SECRET_KEY!).toString(Utf8);
      setApiKey(decyptedKey);
    }
    
  },[setApiKey]); // 空の依存配列を渡すことで、この副作用はコンポーネントがマウントされた時に一度だけ実行されます


  return (
    <>
      {isDialogVisible && ( <ModalDialog /> )}
      {isInputDialogVisible && ( <InputDialog /> )}
      {!isLoggedIn ? <LogInPage /> : <MainContainer />}
    </>
  );
}

export default App;
