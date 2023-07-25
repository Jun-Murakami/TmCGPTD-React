import { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, useSupabaseSession } from './hooks/useSupabaseSession';
import { useUserStore } from './store/userStore';
import { useAppStore } from './store/appStore';
import { Helmet } from 'react-helmet';
import { useDialogStore } from './store/dialogStore';
import { useInputDialogStore } from './store/dialogStore';
import { ModalDialog } from './components/ModalDialog';
import { InputDialog } from './components/InputDialog';
import { MainContainer } from './components/MainContainer';
import { ScrollToBottomButton } from './components/ScrollToBottomButton';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

function App() {
  const session = useSupabaseSession();
  const isDialogVisible = useDialogStore((state) => state.isDialogVisible);
  const isInputDialogVisible = useInputDialogStore((state) => state.isDialogVisible);
  const setApiKey = useUserStore((state) => state.setApiKey);
  const setApiModel = useAppStore((state) => state.setApiModel);
  const [language, setLanguage] = useState('en');
  const [isBottom, setIsBottom] = useState(true);

  const handleScroll = () => {
    const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight;
    setIsBottom(bottom);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const browserLanguage = navigator.language.split('-')[0];
    setLanguage(browserLanguage);
    const apiModel = localStorage.getItem('apiModel');
    setApiModel(apiModel ? apiModel : 'gpt-3.5-turbo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const openAIKey = localStorage.getItem('encryptedKey');
    if (openAIKey) {
      const decyptedKey = AES.decrypt(openAIKey, process.env.REACT_APP_SECRET_KEY!).toString(Utf8);
      setApiKey(decyptedKey);
    }
  }, [setApiKey]);

  return (
    <>
      <Helmet>
        <html lang={language} />
      </Helmet>
      {!isBottom && <ScrollToBottomButton />}
      {isDialogVisible && <ModalDialog />}
      {isInputDialogVisible && <InputDialog />}
      {!session ? (
        <Auth
          supabaseClient={supabase}
          providers={['google', 'azure', 'github']}
          appearance={{
            theme: ThemeSupa,
            style: {
              container: { margin: '10px' },
            },
          }}
        />
      ) : (
        <MainContainer />
      )}
    </>
  );
}

export default App;
