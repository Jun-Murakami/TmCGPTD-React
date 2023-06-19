import React, { Dispatch, SetStateAction } from 'react';
import { useState, useRef } from 'react';
import { Box, Stack, TextField } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { TextFieldMod } from '../components/TextFieldMod';
import { EditPromptButton } from '../components/EditPromptButton';

export function NewChatPage({
  chatTitle,
  setChatTitle,
  systemText,
  setSystemText,
}: {
  chatTitle: string;
  setChatTitle: Dispatch<SetStateAction<string>>;
  systemText: string;
  setSystemText: Dispatch<SetStateAction<string>>;
}) {
  const currentSystemTextRef = useRef('');

  const [isSystemEditing, setIsSystemEditing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSystemEdit = () => {
    currentSystemTextRef.current = systemText;
    setIsSystemEditing(true);
  };

  const handleSystemSaved = () => {
    setIsSaved(true);
    setIsSystemEditing(false);
  };

  const handleSystemCancel = () => {
    setSystemText(currentSystemTextRef.current);
    setIsSystemEditing(false);
  };

  return (
    <Stack sx={{ p: 1, width: '100%', paddingBottom: 10 }} spacing={2} maxWidth={900} minWidth={260}>
      <TextField
        required
        id='outlined-required'
        label='Chat title (Required)'
        placeholder='New chat'
        value={chatTitle}
        onChange={(e) => setChatTitle(e.target.value)}
        sx={{ width: '95%', margin: 'auto' }}
      />
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
          <TextFieldMod isSaved={isSaved} isEditing={isSystemEditing} text={systemText} setText={setSystemText} />
        </Stack>
      </Box>
    </Stack>
  );
}
