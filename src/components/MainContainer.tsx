import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useDialogStore } from '../store/dialogStore';
import { Box } from '@mui/material';
import { SwipeableRoomsDrawer } from '../components/SwipeableRoomsDrawer';
import { PromptInput } from './PromptInput';
import { ChatRoomPage } from './ChatRoomPage';
import { NewChatPage } from './NewChatPage';
import { createChatRoomAndMessagesDb } from '../services/firestore';
import { Message } from '../types/Message';

export function MainContainer() {
  const [inputText, setInputText] = useState<string>('');
  const setUserInput = useChatStore((state) => state.setUserInput);
  const uid = useUserStore((state) => state.uid);
  const apiKey = useUserStore((state) => state.apiKey);
  const isNewChat = useChatStore((state) => state.isNewChat);
  const setIsNewChat = useChatStore((state) => state.setIsNewChat);
  const showDialog = useDialogStore((state) => state.showDialog);

  const [systemText, setSystemText] = useState<string>('');
  const [chatTitle, setChatTitle] = useState<string>('');
  const setCurrentRoomId = useChatStore((state) => state.setCurrentRoomId);

  const handlePostButtonClick = async () => {
    if (isNewChat && inputText.length > 0 && chatTitle.length > 0) {
      const messages: Message[] = [
        { role: 'system', date: new Timestamp(0, 0), text: systemText },
        { role: 'user', date: new Timestamp(0, 0), text: inputText },
        { role: 'assistant', date: new Timestamp(0, 0), text: '' },
      ];
      const newRoomId = await createChatRoomAndMessagesDb(uid!, chatTitle, messages);
      setCurrentRoomId(newRoomId);
      setChatTitle('');
      setIsNewChat(false);
      setUserInput(inputText);
      setInputText('');
    } else if ((isNewChat && apiKey === null) || apiKey === '') {
      await showDialog('Please enter api key.', 'Information');
    } else if (isNewChat && chatTitle === '') {
      await showDialog('Please enter a chat title.', 'Information');
    }
  };

  useEffect(() => {
    if (isNewChat) {
      setSystemText(
        `あなたはOpenAIによってトレーニングされた大規模言語モデルのChatGPTです。ユーザーの指示をStep by Stepで注意深く思考し、Markdownで回答して下さい。`
      );
    }
  }, [isNewChat]);

  return (
    <>
      <SwipeableRoomsDrawer />
      <Box sx={{ width: '100%', paddingTop: 8 }} display='flex' alignItems='center' justifyContent='center' zIndex={0}>
        {isNewChat ? (
          <NewChatPage chatTitle={chatTitle} setChatTitle={setChatTitle} systemText={systemText} setSystemText={setSystemText} />
        ) : (
          <ChatRoomPage />
        )}
      </Box>
      <PromptInput text={inputText} setText={setInputText} onClick={handlePostButtonClick} />
    </>
  );
}
