import { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import { Message } from '../types/types';
import { useChatStore } from '../store/chatStore';
import { useDialogStore } from '../store/dialogStore';
import { updateUserMessageDb, updateSystemMessageDb } from '../services/supabaseDb';
import { useWrapUrlsInSpan } from '../hooks/useWrapUrlsInSpan';

export interface EditableTextAreaProps {
  isEditing: boolean;
  text: string;
  isSaved: boolean;
  id?: number;
  setText: (newText: string) => void;
}

export function TextFieldMod({ isEditing, text, isSaved, id = undefined, setText }: EditableTextAreaProps) {
  const currentMessages = useChatStore((state) => state.currentMessages);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const roomState = useChatStore((state) => state.roomState);
  const setRoomState = useChatStore((state) => state.setRoomState);
  const showDialog = useDialogStore((state) => state.showDialog);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditableText(event.target.value);
  };

  const [editableText, setEditableText] = useState<string>('');

  const processedText = useWrapUrlsInSpan(text);

  useEffect(() => {
    try {
      if (isEditing) {
        setEditableText(text);
      }
      if (isSaved && editableText !== text && editableText !== '') {
        setText(editableText.trim());
        if (id !== undefined && id === roomState.lastUserMessageId) {
          let newUserMessage: Message | null = null;
          let newAssitantMessage: Message | null = null;
          setCurrentMessages(
            currentMessages.map((message) => {
              if (message.id === roomState.lastAssistantMessageId) {
                newAssitantMessage = { ...message, content: '' };
                return newAssitantMessage;
              } else if (message.id === id) {
                newUserMessage = { ...message, content: editableText.trim(), date: new Date() };
                return newUserMessage;
              } else {
                return message;
              }
            })
          );
          const fetchAndSetMessages = async () => {
            await updateUserMessageDb(roomState.currentRoomId!, newUserMessage!, roomState.jsonPrev!);
            setRoomState((prev) => ({
              ...prev,
              json: roomState.jsonPrev,
              userInput: editableText.trim(),
              isNewInputAdded: true,
            }));
          };
          fetchAndSetMessages();
        } else if (id !== undefined) {
          let newMessage: Message | null = null;
          const newMessages = currentMessages.map((message) => {
            if (message.id === id) {
              newMessage = { ...message, content: editableText.trim(), date: new Date() };
              return newMessage;
            } else {
              return message;
            }
          });
          const newJson = roomState.json!.map((message) => {
            if (message.role === 'system') {
              return { ...message, content: editableText.trim() };
            } else {
              return message;
            }
          });
          const newJsonPrev = roomState.jsonPrev!.map((message) => {
            if (message.role === 'system') {
              return { ...message, content: editableText.trim() };
            } else {
              return message;
            }
          });
          const fetchAndSetMessages = async () => {
            await updateSystemMessageDb(roomState.currentRoomId!, newMessage!, newJson, newJsonPrev);
            setCurrentMessages(newMessages);
            setRoomState((prev) => ({ ...prev, json: newJson, jsonPrev: newJsonPrev }));
          };
          fetchAndSetMessages();
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        showDialog(error.message, 'Error');
      } else {
        showDialog('An unknown error occurred.', 'Error');
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
        <Typography
          lineHeight={1.44}
          sx={{
            width: '100%',
            whiteSpace: 'pre-wrap',
          }}
        >
          {processedText}
        </Typography>
      )}
    </>
  );
}
