// src/ChatRoom.tsx
import { useEffect } from 'react';
import { Divider, Stack } from '@mui/material';
import { getMessagesDb, getChatroomDetailDb } from '../services/supabaseDb';
import { Message } from '../types/types';
import { useSystemMessage } from '../hooks/useSystemMessage';
import { useUserMessage } from '../hooks/useUserMessage';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useProcessSendMessage } from '../hooks/useProcessSendMessage';
import { useDialogStore } from '../store/dialogStore';
import { SystemMessage, LastUserMessage, UserMessage, LastAssistantMessage, AssistantMessage } from './ChatRoomComponents';

export function ChatRoomPage() {
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const currentMessages = useChatStore<Message[]>((state) => state.currentMessages);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const userAvatar = useUserStore<string | null>((state) => state.avatarUrl);
  const uuid = useUserStore<string | null>((state) => state.uuid);
  const showDialog = useDialogStore((state) => state.showDialog);

  //システムメッセージの監視と更新-----------------------------------------------
  const { systemMessageState, handleSystemEdit, handleSystemSaved, handleSystemCancel } = useSystemMessage();

  //ユーザーメッセージの監視と更新-----------------------------------------------
  const { userMessageState, handleUserEdit, handleUserSaved, handleUserCancel } = useUserMessage();

  //チャットメインロジック-----------------------------------------------
  useProcessSendMessage();

  //currentRoomIdが変更されたら、chatRoom詳細を取得してcurrentMessagesを更新-----------------------------------------------
  useEffect(() => {
    if (!uuid || !roomState.currentRoomId) return;
    const getChatRoomDetailAsync = async () => {
      await getChatroomDetailDb(roomState.currentRoomId!).then((chatRoom) => {
        if (!chatRoom) {
          showDialog('Failed to load chat room.', 'Error');
          return;
        }
        setRoomState((prevState) => ({
          ...prevState,
          currentRoomName: chatRoom.roomName,
          currentCategory: chatRoom.category,
          json: chatRoom.json,
          jsonPrev: chatRoom.jsonPrev,
        }));
      });
    };
    getChatRoomDetailAsync();

    const getMessageAsync = async () => {
      await getMessagesDb(roomState.currentRoomId!).then(setCurrentMessages);
      if (roomState.userInput !== '') {
        setRoomState((prevState) => ({
          ...prevState,
          isNewInputAdded: true,
        }));
      }
    };
    getMessageAsync();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState.currentRoomId]);

  //currentMessagesが変更されたら、systemMessageId、userLastId、assistantLastIdを更新-----------------------------------------------
  useEffect(() => {
    //最後のシステムメッセージの更新
    let isSystemMessageEnabled = false;
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'system') {
        setRoomState((prevState) => ({
          ...prevState,
          systemMessageId: currentMessages.find((message) => message.role === 'system')?.id,
          systemMessage: currentMessages.find((message) => message.role === 'system')?.content,
        }));
        isSystemMessageEnabled = true;
        break;
      }
    }
    if (!isSystemMessageEnabled) {
      setRoomState((prevState) => ({
        ...prevState,
        systemMessageId: undefined,
        systemMessage: '',
      }));
    }

    //最後のユーザーメッセージの更新
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') {
        setRoomState((prevState) => ({
          ...prevState,
          lastUserMessageId: currentMessages[i].id,
          lastUserMessage: currentMessages[i].content,
        }));
        break;
      }
    }

    //最後のアシスタントメッセージの更新
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'assistant') {
        setRoomState((prevState) => ({
          ...prevState,
          lastAssistantMessageId: currentMessages[i].id,
        }));
        break;
      }
    }

    window.scrollTo({
      top: document.body.scrollHeight,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessages.length]);

  return (
    <Stack
      sx={{ p: 1, width: '100%', paddingBottom: 10 }}
      divider={<Divider orientation='horizontal' flexItem />}
      spacing={2}
      maxWidth={900}
      minWidth={260}
    >
      {currentMessages.map((message) => (
        <div key={message.id}>
          {message.id === roomState.systemMessageId ? (
            <SystemMessage
              message={message}
              systemMessageState={systemMessageState}
              handleSystemEdit={handleSystemEdit}
              handleSystemSaved={handleSystemSaved}
              handleSystemCancel={handleSystemCancel}
              setText={() => setRoomState((prevState) => ({ ...prevState, SystemMessage }))}
            />
          ) : message.role === 'user' && message.id === roomState.lastUserMessageId ? (
            <LastUserMessage
              message={message}
              userAvatar={userAvatar}
              userMessageState={userMessageState}
              handleUserEdit={handleUserEdit}
              handleUserSaved={handleUserSaved}
              handleUserCancel={handleUserCancel}
              setText={() => setRoomState((prevState) => ({ ...prevState, LastUserMessage }))}
            />
          ) : message.role === 'user' && message.id !== roomState.lastUserMessageId ? (
            <UserMessage message={message} userAvatar={userAvatar} />
          ) : message.role === 'assistant' && message.id !== roomState.lastAssistantMessageId ? (
            <AssistantMessage message={message} />
          ) : message.role === 'assistant' && message.id === roomState.lastAssistantMessageId ? (
            <LastAssistantMessage message={message} />
          ) : (
            '' //Do nothing. 最後でないシステムメッセージはここに来る
          )}
        </div>
      ))}
    </Stack>
  );
}
