// src/ChatRoom.tsx
import { useEffect, useState, useRef } from 'react';
import { Box, Card, Divider, Stack, Avatar, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { Message, getMessages, updateMessage } from '../services/firestore';
import { useUserStore } from '../store/userStore';
import { useChatStore } from '../store/chatStore';
import { AiIcon } from '../components/AiIcon';
import { CodeBlock } from '../components/CodeBlock';
import { EditPromptButton } from '../components/EditPromptButton';
import { TextFieldMod } from '../components/TextFieldMod';

export function ChatRoomPage({ roomId }: { roomId: string }) {
  const currentMessages = useChatStore<Message[]>((state) => state.CurrentMessages);
  const userAvatar = useUserStore<string | undefined>((state) => state.photoURL);
  const uid = useUserStore<string | null>((state) => state.uid);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);

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

  useEffect(() => {
    if (!uid || !roomId) return;
    getMessages(uid, roomId).then(setCurrentMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (systemText === '') return;
    const newMessages = currentMessages.map((message) => {
      if (message.role === 'system') {
        const newMessage = { ...message, text: systemText };
        // Update the message in Firestore
        updateMessage(uid!, roomId, newMessage);
        return newMessage;
      } else {
        return message;
      }
    });
    setCurrentMessages(newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemText]);

  useEffect(() => {
    if (userText === '') return;
    const counter: number = 0;
    const newMessages = currentMessages.map((message) => {
      if (message.role === 'user' && counter === currentMessages.length) {
        const newMessage = { ...message, text: userText };
        // Update the message in Firestore
        updateMessage(uid!, roomId, newMessage);
        return newMessage;
      } else {
        return message;
      }
    });
    setCurrentMessages(newMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userText]);

  return (
    <Stack
      sx={{ p: 1, width: '100%', paddingBottom: 10 }}
      divider={<Divider orientation='horizontal' flexItem />}
      spacing={2}
      maxWidth={900}
      minWidth={260}
    >
      {currentMessages.map((message, index) => {
        const isLastUser: boolean = index === currentMessages.length;
        return (
          <div key={message.id}>
            {message.role === 'system' ? (
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
                  <TextFieldMod isSaved={isSystemSaved} isEditing={isSystemEditing} text={message.text} setText={setSystemText} />
                </Stack>
              </Box>
            ) : (
              <Card sx={message.role === 'assistant' ? { backgroundColor: 'grey.100', p: 1.5 } : { p: 1.5 }}>
                <Stack direction='row'>
                  {message.role === 'user' ? (
                    <Avatar alt='Avatar' src={userAvatar} sx={{ width: 30, height: 30 }} />
                  ) : (
                    <AiIcon sx={{ fontSize: 30 }} color='primary' />
                  )}
                  {isLastUser && (
                    <EditPromptButton
                      isEditing={isUserEditing}
                      onEdit={handleUserEdit}
                      onSave={handleUserSaved}
                      onCancel={handleUserCancel}
                      marginTop={2}
                    />
                  )}
                  <Stack sx={{ pl: 1.5 }} marginTop={-1.5} width={'100%'}>
                    {message.role === 'user' ? (
                      <Box marginTop={1.5}>
                        <TextFieldMod isSaved={isUserSaved} isEditing={isUserEditing} text={message.text} setText={setUserText} />
                      </Box>
                    ) : (
                      makeMarkedHtml(message.text)
                    )}
                    <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
                      <Typography variant='caption' textAlign='right'>{`[${message.date.toDate().toLocaleString()}]`}</Typography>
                      {message.role === 'assistant' && (
                        <Typography variant='caption' sx={{ lineBreak: 'anywhere' }} textAlign='right'>
                          {message.usage}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            )}
          </div>
        );
      })}
    </Stack>
  );
}
