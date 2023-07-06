// src/ChatRoom.tsx
import { useEffect } from 'react';
import { Box, Card, Divider, Stack, Avatar, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { getMessagesDb, getChatroomDetailDb } from '../services/supabaseDb';
import { Message } from '../types/types';
import { useSystemMessage } from '../hooks/useSystemMessage';
import { useUserMessage } from '../hooks/useUserMessage';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useAppStore } from '../store/appStore';
import { ChatRoom } from '../types/types';
import { useProcessSendMessage } from '../hooks/useProcessSendMessage';
import { useDialogStore } from '../store/dialogStore';
import { AiIcon } from '../components/AiIcon';
import { CodeBlock } from '../components/CodeBlock';
import { EditPromptButton } from '../components/EditPromptButton';
import { TextFieldMod } from '../components/TextFieldMod';

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

  //アシスタントメッセージの監視と更新-----------------------------------------------
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessages.length]);

  //マークダウン変換--------------------------------------------------------------
  const makeMarkedHtml = (html: string) => {
    return (
      <ReactMarkdown
        children={html}
        className='markdownBody'
        components={{
          code: CodeBlock,
        }}
      />
    );
  };

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
            <Box sx={{ p: 1.5, alignItems: 'left' }}>
              <Stack spacing={2}>
                <PsychologyIcon sx={{ fontSize: 30, marginTop: 0 }} color='primary' />
                <EditPromptButton
                  isEditing={systemMessageState.isTextEditing}
                  onEdit={handleSystemEdit}
                  onSave={handleSystemSaved}
                  onCancel={handleSystemCancel}
                  marginTop={0}
                />
              </Stack>
              <Box sx={{ pl: 5, width: '100%' }} marginTop={-3.4}>
                <TextFieldMod
                  isSaved={systemMessageState.isTextSaved}
                  isEditing={systemMessageState.isTextEditing}
                  text={roomState.systemMessage!}
                  id={message.id}
                  setText={(newText) => setRoomState((prev) => ({ ...prev, systemMessage: newText }))}
                />
              </Box>
            </Box>
          ) : (
            <Card sx={{ p: 1.5, display: 'block' }}>
              {message.role === 'user' ? (
                <>
                  <Avatar alt='Avatar' src={userAvatar!} sx={{ width: 30, height: 30 }} />
                  {message.id === roomState.lastUserMessageId && (
                    <EditPromptButton
                      isEditing={userMessageState.isTextEditing}
                      onEdit={handleUserEdit}
                      onSave={handleUserSaved}
                      onCancel={handleUserCancel}
                      marginTop={-1}
                    />
                  )}
                </>
              ) : (
                <AiIcon sx={{ fontSize: 30 }} color='primary' />
              )}
              <Stack sx={{ pl: 5 }} marginTop={-6.1} width={'100%'}>
                {message.role === 'user' ? (
                  <Box marginTop={2.7} sx={{ width: '100%' }}>
                    {message.id === roomState.lastUserMessageId ? (
                      <TextFieldMod
                        isSaved={userMessageState.isTextSaved}
                        isEditing={userMessageState.isTextEditing}
                        text={roomState.lastUserMessage!}
                        id={message.id!}
                        setText={(newText) =>
                          setRoomState((prevState) => ({
                            ...prevState,
                            lastUserMessage: newText,
                          }))
                        }
                      />
                    ) : (
                      <Typography
                        lineHeight={1.44}
                        sx={{
                          width: '100%',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {message.content}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  makeMarkedHtml(message.content)
                )}
                <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
                  <Typography variant='caption' textAlign='right'>
                    {message.date.getFullYear() > 1
                      ? `[${message.date.toLocaleDateString() + ' ' + message.date.toLocaleTimeString()}]`
                      : `[Web Chat]`}
                  </Typography>
                  {message.role === 'assistant' ? (
                    <Typography variant='caption' sx={{ lineBreak: 'anywhere', whiteSpace: 'pre-wrap' }} textAlign='right'>
                      {message.usage}
                    </Typography>
                  ) : (
                    ''
                  )}
                </Stack>
              </Stack>
            </Card>
          )}
        </div>
      ))}
    </Stack>
  );
}
