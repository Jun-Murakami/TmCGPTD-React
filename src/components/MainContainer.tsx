import { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { useAppStore } from '../store/appStore';
import { useDialogStore } from '../store/dialogStore';
import { Box } from '@mui/material';
import { SwipeableRoomsDrawer } from '../components/SwipeableRoomsDrawer';
import { PromptInput } from './PromptInput';
import { ChatRoomPage } from './ChatRoomPage';
import { NewChatPage } from './NewChatPage';
import { createChatRoomAndMessagesDb, getChatRoomsDb, addMessageDb, getMessagesDb } from '../services/supabaseDb';
import { Message } from '../types/types';

export function MainContainer() {
  const showDialog = useDialogStore((state) => state.showDialog);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const inputText = useAppStore((state) => state.inputText);
  const setInputText = useAppStore((state) => state.setInputText);

  const uuid = useUserStore((state) => state.uuid);
  const apiKey = useUserStore((state) => state.apiKey);

  useEffect(() => {
    const getChatRoomsAync = async () => {
      const rooms = await getChatRoomsDb(uuid!);
      setRoomState((prev) => ({ ...prev, currentRoomName: '', chatRooms: rooms }));
    };
    getChatRoomsAync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostButtonClick = async () => {
    if (roomState.isNewChat && inputText.length > 0 && roomState.currentRoomName!.length > 0) {
      const messages: Message[] = [
        { role: 'system', date: new Date(), text: roomState.systemMessage! },
        { role: 'user', date: new Date(), text: inputText },
        { role: 'assistant', date: new Date(), text: '' },
      ];
      const newRoomId = await createChatRoomAndMessagesDb(uuid!, roomState.currentRoomName!, messages);
      const newRooms = await getChatRoomsDb(uuid!);
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
        { role: 'user', date: new Date(), text: inputText },
        { role: 'assistant', date: new Date(), text: '' },
      ];
      await addMessageDb(uuid!, roomState.currentRoomId!, messages);
      await getMessagesDb(uuid!, roomState.currentRoomId!).then(setCurrentMessages);
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
      <Box sx={{ width: '100%', paddingTop: 8 }} display='flex' alignItems='center' justifyContent='center'>
        {roomState.isNewChat ? <NewChatPage /> : <ChatRoomPage />}
      </Box>
      <PromptInput onClick={handlePostButtonClick} />
    </>
  );
}
