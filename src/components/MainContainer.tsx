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
import {
  createChatRoomAndMessagesDb,
  getChatRoomsDb,
  addMessageDb,
  getMessagesDb,
  removeEditableMarkDb,
} from '../services/supabaseDb';
import { Message } from '../types/types';

export function MainContainer() {
  const showDialog = useDialogStore((state) => state.showDialog);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const inputText = useAppStore((state) => state.inputText);
  const setInputText = useAppStore((state) => state.setInputText);
  const apiKey = useUserStore((state) => state.apiKey);
  const uuid = useUserStore((state) => state.uuid);

  useEffect(() => {
    const getChatRoomsAync = async () => {
      const rooms = await getChatRoomsDb();
      setRoomState((prev) => ({ ...prev, currentRoomName: '', chatRooms: rooms }));
    };
    getChatRoomsAync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostButtonClick = async () => {
    if (!uuid) {
      await showDialog('An unknown error occurred.', 'Error');
      return;
    }

    // 新規チャットの場合
    if (roomState.isNewChat && inputText.length > 0) {
      try {
        const messages: Message[] = [
          { role: 'system', date: new Date(), content: '#System' + roomState.systemMessage! + '---', usage: '' },
          { role: 'user', date: new Date(), content: inputText + '\n\n(!--editable--)', usage: '' },
          { role: 'assistant', date: new Date(), content: '', usage: '' },
        ];
        const newRoomId = await createChatRoomAndMessagesDb(uuid!, roomState.currentRoomName!, messages);
        const newRooms = await getChatRoomsDb();
        setRoomState((prev) => ({
          ...prev,
          chatRooms: newRooms,
          currentRoomId: newRoomId,
          isNewChat: false,
          userInput: inputText,
        }));
        setInputText('');
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }
      // 既存ルームへの送信の場合
    } else if (!roomState.isNewChat && inputText.length > 0) {
      try {
        const messages: Message[] = [
          { role: 'user', date: new Date(), content: inputText + '\n\n(!--editable--)', usage: '' },
          { role: 'assistant', date: new Date(), content: '', usage: '' },
        ];
        await addMessageDb(uuid!, roomState.currentRoomId!, messages);
        await removeEditableMarkDb(roomState.lastUserMessageId!);
        await getMessagesDb(roomState.currentRoomId!).then(setCurrentMessages);
        setRoomState((prev) => ({ ...prev, isNewInputAdded: true, userInput: inputText }));
        setInputText('');
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }
    } else if (roomState.isNewChat && (apiKey === null || apiKey === '' || apiKey === undefined)) {
      await showDialog('Please enter api key.', 'Information');
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
