import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { Box } from '@mui/material';
import { SwipeableRoomsDrawer } from '../components/SwipeableRoomsDrawer';
import { PromptInput } from './PromptInput';
import { ChatRoomPage } from './ChatRoomPage';
import { NewChatPage } from './NewChatPage';
import { createChatRoomAndMessages, Message } from '../services/firestore';

export function MainContainer() {
  const [inputText, setInputText] = useState<string>('');
  const uid = useUserStore((state) => state.uid);
  const isNewChat = useChatStore((state) => state.isNewChat);

  const [systemText, setSystemText] = useState<string>('');
  const [chatTitle, setChatTitle] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');

  const handlePostButtonClick = async () => {
    if (isNewChat && inputText.length > 0 && chatTitle.length > 0) {
      const messages: Message[] = [
        { role: 'system', date: new Timestamp(0, 0), text: systemText },
        { role: 'user', date: new Timestamp(0, 0), text: inputText },
      ];
      const newRoomId = await createChatRoomAndMessages(uid!, chatTitle, messages);
      setRoomId(newRoomId);
      useChatStore.setState({ isNewChat: false });
      setInputText('');
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
    <Box>
      <Box component='nav'>
        <SwipeableRoomsDrawer />
      </Box>
      <Box
        sx={{ backgroundColor: '#eeeeee', width: '100%', paddingTop: 8 }}
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        {isNewChat ? (
          <NewChatPage chatTitle={chatTitle} setChatTitle={setChatTitle} systemText={systemText} setSystemText={setSystemText} />
        ) : (
          <ChatRoomPage roomId={roomId} />
        )}
      </Box>
      <PromptInput text={inputText} setText={setInputText} onClick={handlePostButtonClick} />
    </Box>
  );
}
