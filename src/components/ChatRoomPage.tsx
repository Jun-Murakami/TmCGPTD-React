// src/ChatRoom.tsx
import { useEffect, useState, useRef } from 'react';
import { createChat } from 'completions';
import { encode } from 'gpt-tokenizer';
import { Timestamp } from 'firebase/firestore';
import { Box, Card, Divider, Stack, Avatar, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { getMessagesDb, updateMessageDb, updateAssistantMessageDb } from '../services/firestore';
import { Message } from '../types/Message';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { useAppStore } from '../store/appStore';
import { useDialogStore } from '../store/dialogStore';
import { AiIcon } from '../components/AiIcon';
import { CodeBlock } from '../components/CodeBlock';
import { EditPromptButton } from '../components/EditPromptButton';
import { TextFieldMod } from '../components/TextFieldMod';

export function ChatRoomPage() {
  const currentMessages = useChatStore<Message[]>((state) => state.currentMessages);
  const currentRoomId = useChatStore<string | undefined>((state) => state.currentRoomId);
  const userAvatar = useUserStore<string | undefined>((state) => state.photoURL);
  const uid = useUserStore<string | null>((state) => state.uid);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const showDialog = useDialogStore((state) => state.showDialog);

  //システムメッセージの監視と更新-----------------------------------------------
  const [systemTextId, setSystemTextId] = useState<string>('');
  const [systemText, setSystemText] = useState<string>('');
  const [isSystemEditing, setIsSystemEditing] = useState<boolean>(false);
  const [isSystemSaved, setIsSystemSaved] = useState<boolean>(false);
  const currentSystemTextRef = useRef('');

  const handleSystemEdit = () => {
    currentSystemTextRef.current = systemText;
    setIsSystemEditing(true);
    setIsSystemSaved(false);
  };

  const handleSystemSaved = () => {
    setIsSystemSaved(true);
    setIsSystemEditing(false);
  };

  const handleSystemCancel = () => {
    setSystemText(currentSystemTextRef.current);
    setIsSystemEditing(false);
  };

  useEffect(() => {
    if (systemText === '') return;
    const newMessages = currentMessages.map((message) => {
      if (message.id === systemTextId) {
        const newMessage = { ...message, text: systemText };
        // Update the message in Firestore
        updateMessageDb(uid!, currentRoomId!, newMessage);
        return newMessage;
      } else {
        return message;
      }
    });
    setCurrentMessages(newMessages);
    console.log('systemText updated' + newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemText]);

  //ユーザーメッセージの監視と更新-----------------------------------------------
  const [userLastId, setUserLastId] = useState<string>('');
  const [userText, setUserText] = useState<string>('');
  const [isUserEditing, setIsUserEditing] = useState<boolean>(false);
  const [isUserSaved, setIsUserSaved] = useState<boolean>(false);
  const currentUserTextRef = useRef('');

  const handleUserEdit = () => {
    currentUserTextRef.current = userText;
    setIsUserEditing(true);
    setIsUserSaved(false);
  };

  const handleUserSaved = () => {
    setIsUserSaved(true);
    setIsUserEditing(false);
  };

  const handleUserCancel = () => {
    setUserText(currentUserTextRef.current);
    setIsUserEditing(false);
  };

  useEffect(() => {
    if (userText === '') return;
    const newMessages = currentMessages.map((message) => {
      if (message.id === userLastId) {
        const newMessage = { ...message, text: userText };
        // Update the message in Firestore
        updateMessageDb(uid!, currentRoomId!, newMessage);
        return newMessage;
      } else {
        return message;
      }
    });
    setCurrentMessages(newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userText]);

  //アシスタントメッセージの監視と更新-----------------------------------------------
  const [assistantLastId, setAssistantLastId] = useState<string>('');
  const userInput = useChatStore<string>((state) => state.userInput);
  const setUserInput = useChatStore((state) => state.setUserInput);
  const apiKey = useUserStore<string | null>((state) => state.apiKey);
  const model = useAppStore<string | null>((state) => state.apiModel);
  const isNewInputAdded = useChatStore<boolean>((state) => state.isNewInputAdded);
  const setIsNewInputAdded = useChatStore((state) => state.setIsNewInputAdded);

  useEffect(() => {
    if (!isNewInputAdded) return;

    const getAssistantMessage = async () => {
      if (!apiKey || !model || !userInput) return;
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
        await chat.sendMessage(userInput, (message) => {
          if (message.message?.choices === undefined) return;
          if (message.message?.choices[0].delta === undefined) return;

          const delta = message.message.choices[0].delta;
          if ('content' in delta) {
            const content = delta.content;
            setCurrentMessages((currentMessages) => {
              const newMessages = currentMessages.map((message: Message) => {
                if (message.id === assistantLastId) {
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
        await updateAssistantMessageDb(uid!, currentRoomId!, updatedMessage);
      }
    };
    getAssistantMessage();

    setIsNewInputAdded(false);
    setUserInput('');
  }, [isNewInputAdded]);

  //currentRoomIdが変更されたら、currentMessagesを更新-----------------------------------------------
  useEffect(() => {
    if (!uid || !currentRoomId) return;
    const getMessageAsync = async () => {
      await getMessagesDb(uid, currentRoomId).then(setCurrentMessages);
    };
    getMessageAsync();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRoomId]);

  //currentMessagesコレクションが変更されたら、systemTextId, userLastId, assistantLastIdを更新-----------------------------------------------
  useEffect(() => {
    const getMessageIds = async () => {
      const systemTextId = currentMessages.find((message) => message.role === 'system')?.id;
      setSystemTextId(systemTextId!);

      let lastUserId: string | undefined = '';
      for (let i = currentMessages.length - 1; i >= 0; i--) {
        if (currentMessages[i].role === 'user') {
          lastUserId = currentMessages[i].id;
          break;
        }
      }
      setUserLastId(lastUserId!);

      let lastAssistantId: string | undefined = '';
      for (let i = currentMessages.length - 1; i >= 0; i--) {
        if (currentMessages[i].role === 'assistant') {
          lastAssistantId = currentMessages[i].id;
          break;
        }
      }
      setAssistantLastId(lastAssistantId!);

      if (userInput !== '') {
        setIsNewInputAdded(true);
      }
    };
    getMessageIds();
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
          {message.id === systemTextId ? (
            <Box sx={{ p: 1.5, alignItems: 'left' }}>
              <Stack direction='row'>
                <Stack spacing={2}>
                  <PsychologyIcon sx={{ fontSize: 30, marginTop: 0 }} color='primary' />
                  <EditPromptButton
                    isEditing={isSystemEditing}
                    onEdit={handleSystemEdit}
                    onSave={handleSystemSaved}
                    onCancel={handleSystemCancel}
                    marginTop={0}
                  />
                </Stack>
                <Box sx={{ pl: 1.5, width: '100%' }}>
                  <TextFieldMod isSaved={isSystemSaved} isEditing={isSystemEditing} text={message.text} setText={setSystemText} />
                </Box>
              </Stack>
            </Box>
          ) : (
            <Card sx={message.role === 'assistant' ? { backgroundColor: 'grey.100', p: 1.5 } : { p: 1.5 }}>
              <Stack direction='row'>
                {message.role === 'user' ? (
                  <>
                    <Avatar alt='Avatar' src={userAvatar} sx={{ width: 30, height: 30 }} />
                    {message.id === userLastId && (
                      <EditPromptButton
                        isEditing={isUserEditing}
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
                      <TextFieldMod isSaved={isUserSaved} isEditing={isUserEditing} text={message.text} setText={setUserText} />
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
