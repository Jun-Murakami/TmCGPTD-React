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
import { createChatRoomAndMessagesDb, getChatRoomsDb, addMessageDb, getMessagesDb } from '../services/firestore';
import { Message } from '../types/types';

export function MainContainer() {
  const showDialog = useDialogStore((state) => state.showDialog);

  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);

  useEffect(() => {
    const getChatRoomsAync = async () => {
      const rooms = await getChatRoomsDb(uid!);
      setRoomState((prev) => ({ ...prev, chatRooms: rooms }));
    };
    getChatRoomsAync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [inputText, setInputText] = useState<string>('');

  const uid = useUserStore((state) => state.uid);
  const apiKey = useUserStore((state) => state.apiKey);

  const handlePostButtonClick = async () => {
    if (roomState.isNewChat && inputText.length > 0 && roomState.currentRoomName!.length > 0) {
      const messages: Message[] = [
        { role: 'system', date: Timestamp.now(), text: roomState.systemMessage! },
        { role: 'user', date: Timestamp.now(), text: inputText },
        { role: 'assistant', date: Timestamp.now(), text: '' },
      ];
      const newRoomId = await createChatRoomAndMessagesDb(uid!, roomState.currentRoomName!, messages);
      const newRooms = await getChatRoomsDb(uid!);
      setRoomState((prev) => ({
        ...prev,
        chatRooms: newRooms,
        currentRoomId: newRoomId,
        isNewChat: false,
        userInput: inputText,
      }));
      setInputText('');
    } else if (!roomState.isNewChat && inputText.length > 0) {
      const messages: Message[] = [
        { role: 'user', date: Timestamp.now(), text: inputText },
        { role: 'assistant', date: Timestamp.now(), text: '' },
      ];
      await addMessageDb(uid!, roomState.currentRoomId!, messages);
      await getMessagesDb(uid!, roomState.currentRoomId!).then(setCurrentMessages);
      setRoomState((prev) => ({ ...prev, isNewInputAdded: true, userInput: inputText }));
      setInputText('');
    } else if ((roomState.isNewChat && apiKey === null) || apiKey === '') {
      await showDialog('Please enter api key.', 'Information');
    } else if (roomState.isNewChat && roomState.currentRoomName! === '') {
      await showDialog('Please enter a chat title.', 'Information');
    }
  };

  return (
    <>
      <SwipeableRoomsDrawer />
      <Box sx={{ width: '100%', paddingTop: 8 }} display='flex' alignItems='center' justifyContent='center' zIndex={0}>
        {roomState.isNewChat ? <NewChatPage /> : <ChatRoomPage />}
      </Box>
      <PromptInput text={inputText} setText={setInputText} onClick={handlePostButtonClick} />
    </>
  );
}
