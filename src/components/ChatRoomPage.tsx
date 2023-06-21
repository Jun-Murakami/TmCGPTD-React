// src/ChatRoom.tsx
import { useEffect } from 'react';
import { createChat } from 'completions';
import { encode } from 'gpt-tokenizer';
import { Timestamp } from 'firebase/firestore';
import { Box, Card, Divider, Stack, Avatar, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { getMessagesDb, updateAssistantMessageDb } from '../services/firestore';
import { Message } from '../types/types';
import { useSystemMessage } from '../hooks/useSystemMessage';
import { useUserMessage } from '../hooks/useUserMessage';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useAppStore } from '../store/appStore';
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
  const userAvatar = useUserStore<string | undefined>((state) => state.photoURL);
  const uid = useUserStore<string | null>((state) => state.uid);
  const showDialog = useDialogStore((state) => state.showDialog);

  const { systemMessageState, handleSystemEdit, handleSystemSaved, handleSystemCancel } = useSystemMessage();
  const { userMessageState, handleUserEdit, handleUserSaved, handleUserCancel } = useUserMessage();

  //アシスタントメッセージの監視と更新-----------------------------------------------
  const apiKey = useUserStore<string | null>((state) => state.apiKey);
  const model = useAppStore<string | null>((state) => state.apiModel);

  useEffect(() => {
    if (!roomState.isNewInputAdded || !apiKey || !model || roomState.userInput === '') return;

    const getAssistantMessage = async () => {
      const chat = createChat({
        apiKey: apiKey,
        model: model,
      });

      const prompts = currentMessages.slice(0, -1).map((message) => {
        return message.text;
      });
      const promptTokens = encode(prompts.join()).length;

      const messages = currentMessages.slice(0, -2).map((message) => {
        return { role: message.role, content: message.text };
      });
      for (const message of messages) {
        chat.addMessage(message);
      }

      let updatedMessage: Message | null = null; // 更新されたメッセージを保持する変数

      try {
        await chat.sendMessage(roomState.userInput, (message) => {
          if (message.message?.choices === undefined) return;
          if (message.message?.choices[0].delta === undefined) return;

          const delta = message.message.choices[0].delta;
          if ('content' in delta) {
            const content = delta.content;
            setCurrentMessages((currentMessages) => {
              const newMessages = currentMessages.map((message: Message) => {
                if (message.id === roomState.lastAssistantMessageId) {
                  const newAssistantText = message.text + content;
                  const comletionTokens = encode(newAssistantText).length;
                  const newMessage = {
                    ...message,
                    text: newAssistantText,
                    usage:
                      '[tokens] prompt:' +
                      promptTokens +
                      ', completion:' +
                      comletionTokens +
                      ', total:' +
                      (promptTokens + comletionTokens),
                    date: Timestamp.now(),
                  };
                  updatedMessage = newMessage; // 更新されたメッセージを保持
                  return newMessage;
                } else {
                  return message;
                }
              });
              return newMessages;
            });
          } else if ('role' in delta) {
          } else if (message.message.choices[0].finish_reason !== 'stop') {
            throw new Error('Unexpected message');
          }
        });
      } catch (ex) {
        if (ex instanceof Error) {
          await showDialog(ex.message, 'Error');
        } else {
          await showDialog('An unknown error occurred.', 'Error');
        }
      }

      // sendMessageが完了した後にデータベースを更新
      if (updatedMessage) {
        await updateAssistantMessageDb(uid!, roomState.currentRoomId!, updatedMessage);
      }
    };
    getAssistantMessage();

    setRoomState((prevState) => ({
      ...prevState,
      isNewInputAdded: false,
      userInput: '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomState.isNewInputAdded]);

  //currentRoomIdが変更されたら、currentMessagesを更新-----------------------------------------------
  useEffect(() => {
    if (!uid || !roomState.currentRoomId) return;
    const getMessageAsync = async () => {
      await getMessagesDb(uid, roomState.currentRoomId!).then(setCurrentMessages);
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
    //システムメッセージの更新
    setRoomState((prevState) => ({
      ...prevState,
      systemMessageId: currentMessages.find((message) => message.role === 'system')?.id,
      systemMessage: currentMessages.find((message) => message.role === 'system')?.text,
    }));

    //ユーザーメッセージの更新
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user') {
        setRoomState((prevState) => ({
          ...prevState,
          lastUserMessageId: currentMessages[i].id,
          lastUserMessage: currentMessages[i].text,
        }));
        break;
      }
    }

    //アシスタントメッセージの更新
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
  }, [currentMessages]);

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
              <Stack direction='row'>
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
                <Box sx={{ pl: 1.5, width: '100%' }}>
                  <TextFieldMod
                    isSaved={systemMessageState.isTextSaved}
                    isEditing={systemMessageState.isTextEditing}
                    text={roomState.systemMessage!}
                    id={message.id}
                    setText={(newText) => setRoomState((prev) => ({ ...prev, systemMessage: newText }))}
                  />
                </Box>
              </Stack>
            </Box>
          ) : (
            <Card sx={message.role === 'assistant' ? { backgroundColor: 'grey.50', p: 1.5 } : { p: 1.5 }}>
              <Stack direction='row'>
                {message.role === 'user' ? (
                  <>
                    <Avatar alt='Avatar' src={userAvatar} sx={{ width: 30, height: 30 }} />
                    {message.id === roomState.lastUserMessageId && (
                      <EditPromptButton
                        isEditing={userMessageState.isTextEditing}
                        onEdit={handleUserEdit}
                        onSave={handleUserSaved}
                        onCancel={handleUserCancel}
                        marginTop={2}
                      />
                    )}
                  </>
                ) : (
                  <AiIcon sx={{ fontSize: 30 }} color='primary' />
                )}
                <Stack sx={{ pl: 1.5 }} marginTop={-1.5} width={'100%'}>
                  {message.role === 'user' ? (
                    <Box marginTop={1.5} sx={{ width: '100%' }}>
                      <TextFieldMod
                        isSaved={userMessageState.isTextSaved}
                        isEditing={userMessageState.isTextEditing}
                        text={message.id === roomState.lastUserMessageId ? roomState.lastUserMessage! : message.text!}
                        id={message.id!}
                        setText={(newText) =>
                          setRoomState((prevState) => ({
                            ...prevState,
                            lastUserMessage: newText,
                          }))
                        }
                      />
                    </Box>
                  ) : (
                    makeMarkedHtml(message.text)
                  )}
                  <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
                    <Typography variant='caption' textAlign='right'>{`[${message.date.toDate().toLocaleString()}]`}</Typography>
                    {message.role === 'assistant' ? (
                      <Typography variant='caption' sx={{ lineBreak: 'anywhere' }} textAlign='right'>
                        {message.usage}
                      </Typography>
                    ) : (
                      ''
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          )}
        </div>
      ))}
    </Stack>
  );
}
