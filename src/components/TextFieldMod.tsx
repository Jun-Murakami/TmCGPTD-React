import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { TextField, Box } from '@mui/material';
import { Message } from '../types/types';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../store/userStore';
import { updateMessageDb } from '../services/firestore';

export interface EditableTextAreaProps {
  isEditing: boolean;
  text: string;
  isSaved: boolean;
  id?: string;
  setText: (newText: string) => void;
}

export function TextFieldMod({ isEditing, text, isSaved, id = '', setText }: EditableTextAreaProps) {
  const currentMessages = useChatStore((state) => state.currentMessages);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const uid = useUserStore<string | null>((state) => state.uid);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableText(event.target.value);
  };

  const [editableText, setEditableText] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      setEditableText(text);
    }
    if (isSaved && editableText !== text && editableText !== '') {
      setText(editableText.trim());
      if (id !== '' && id === roomState.lastUserMessageId) {
        let newUserMessage: Message | null = null;
        let newAssitantMessage: Message | null = null;
        setCurrentMessages(
          currentMessages.map((message) => {
            if (message.id === roomState.lastAssistantMessageId) {
              newAssitantMessage = { ...message, text: '' };
              return newAssitantMessage;
            } else if (message.id === id) {
              newUserMessage = { ...message, text: editableText, date: Timestamp.now() };
              return newUserMessage;
            } else {
              return message;
            }
          })
        );
        const fetchAndSetMessages = async () => {
          await updateMessageDb(uid!, roomState.currentRoomId!, newUserMessage!);
          setRoomState((prev) => ({ ...prev, userInput: editableText.trim(), isNewInputAdded: true }));
        };
        fetchAndSetMessages();
      } else if (id !== '') {
        let newMessage: Message | null = null;
        const newMessages = currentMessages.map((message) => {
          if (message.id === id) {
            newMessage = { ...message, text: editableText };
            return newMessage;
          } else {
            return message;
          }
        });
        const fetchAndSetMessages = async () => {
          await updateMessageDb(uid!, roomState.currentRoomId!, newMessage!);
          setCurrentMessages(newMessages);
        };
        fetchAndSetMessages();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isSaved]);

  return (
    <>
      {isEditing ? (
        <TextField
          multiline
          id='standard-multiline'
          variant='standard'
          sx={{ marginTop: -0.5, width: '100%', minHeight: 100 }}
          value={editableText}
          onChange={handleChange}
          fullWidth
        />
      ) : (
        <Box lineHeight={1.44} whiteSpace={'pre-wrap'}>
          {text}
        </Box>
      )}
    </>
  );
}
