import React, { useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useSystemMessage } from '../hooks/useSystemMessage';
import { Box, Stack, TextField } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { TextFieldMod } from '../components/TextFieldMod';
import { EditPromptButton } from '../components/EditPromptButton';

export function NewChatPage() {
  const { systemMessageState, handleSystemEdit, handleSystemSaved, handleSystemCancel } = useSystemMessage();

  const roomName = useChatStore((state) => state.roomState.currentRoomName!);
  const systemMessage = useChatStore((state) => state.roomState.systemMessage!);
  const setCurrentMessages = useChatStore((state) => state.setCurrentMessages);
  const setRoomState = useChatStore((state) => state.setRoomState);

  useEffect(() => {
    setRoomState((prev) => ({
      ...prev,
      currentRoomId: undefined,
      currentRoomName: '',
      json: [],
      jsonPrev: [],
      systemMessage: `You are ChatGPT, a large scale language model trained by OpenAI.\nThink carefully Step by Step through the user's instructions and answer in Markdown.`,
    }));
    setCurrentMessages([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack sx={{ p: 1, width: '100%', paddingBottom: 10 }} spacing={2} maxWidth={900} minWidth={260} zIndex={0}>
      <TextField
        required
        id='outlined'
        label='Chat title (Optional)'
        placeholder='New chat'
        name='Chat title'
        autoComplete='off'
        value={roomName}
        onChange={(e) => setRoomState((prev) => ({ ...prev, currentRoomName: e.target.value }))}
        sx={{ width: '95%', margin: 'auto', zIndex: 0 }}
      />
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
              text={systemMessage}
              setText={(newText) => setRoomState((prev) => ({ ...prev, systemMessage: newText }))}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
