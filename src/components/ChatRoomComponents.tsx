import React from 'react';
import { Box, Card, Stack, Avatar, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/types';
import { AiIcon } from '../components/AiIcon';
import { CodeBlock } from '../components/CodeBlock';
import { EditPromptButton } from '../components/EditPromptButton';
import { TextFieldMod } from '../components/TextFieldMod';
import { EditableMessageState } from '../types/types';

type SystemMessageProps = {
  message: Message;
  systemMessageState: EditableMessageState;
  handleSystemEdit: () => void;
  handleSystemSaved: () => void;
  handleSystemCancel: () => void;
  setText: (newText: string) => void;
};

export function SystemMessage({
  message,
  systemMessageState,
  handleSystemEdit,
  handleSystemSaved,
  handleSystemCancel,
  setText,
}: SystemMessageProps) {
  return (
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
          text={message.content}
          id={message.id}
          setText={setText}
        />
      </Box>
    </Box>
  );
}

type LastUserMessageProps = {
  message: Message;
  userAvatar: string | null;
  userMessageState: EditableMessageState;
  handleUserEdit: () => void;
  handleUserSaved: () => void;
  handleUserCancel: () => void;
  setText: (newText: string) => void;
};

export function LastUserMessage({
  message,
  userAvatar,
  userMessageState,
  handleUserEdit,
  handleUserSaved,
  handleUserCancel,
  setText,
}: LastUserMessageProps) {
  return (
    <Card sx={{ p: 1.5, display: 'block' }}>
      <Avatar alt='Avatar' src={userAvatar!} sx={{ width: 30, height: 30 }} />
      <EditPromptButton
        isEditing={userMessageState.isTextEditing}
        onEdit={handleUserEdit}
        onSave={handleUserSaved}
        onCancel={handleUserCancel}
        marginTop={-1}
      />
      <Stack sx={{ pl: 5 }} marginTop={-6.1} width={'100%'}>
        <Box marginTop={2.7} sx={{ width: '100%' }}>
          <TextFieldMod
            isSaved={userMessageState.isTextSaved}
            isEditing={userMessageState.isTextEditing}
            text={message.content}
            id={message.id!}
            setText={setText}
          />
        </Box>
        <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
          <Typography variant='caption' textAlign='right'>
            {message.date.getFullYear() > 1
              ? `[${message.date.toLocaleDateString() + ' ' + message.date.toLocaleTimeString()}]`
              : `[Web Chat]`}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

type UserMessageProps = {
  message: Message;
  userAvatar: string | null;
};

export const UserMessage = React.memo(({ message, userAvatar }: UserMessageProps) => {
  return (
    <Card sx={{ p: 1.5, display: 'block' }}>
      <Avatar alt='Avatar' src={userAvatar!} sx={{ width: 30, height: 30 }} />
      <Stack sx={{ pl: 5 }} marginTop={-6.1} width={'100%'}>
        <Box marginTop={2.7} sx={{ width: '100%' }}>
          <Typography
            lineHeight={1.44}
            sx={{
              width: '100%',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </Typography>
        </Box>
        <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
          <Typography variant='caption' textAlign='right'>
            {message.date.getFullYear() > 1
              ? `[${message.date.toLocaleDateString() + ' ' + message.date.toLocaleTimeString()}]`
              : `[Web Chat]`}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
});

type AssistantMessageProps = {
  message: Message;
};

export function LastAssistantMessage({ message }: AssistantMessageProps) {
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
    <Card sx={{ p: 1.5, display: 'block' }}>
      <AiIcon sx={{ fontSize: 30 }} color='primary' />
      <Stack sx={{ pl: 5 }} marginTop={-6.1} width={'100%'}>
        {makeMarkedHtml(message.content)}
        <Stack marginBottom={1.5} sx={{ color: 'grey.500' }} width={'100%'}>
          <Typography variant='caption' textAlign='right'>
            {message.date.getFullYear() > 1
              ? `[${message.date.toLocaleDateString() + ' ' + message.date.toLocaleTimeString()}]`
              : `[Web Chat]`}
          </Typography>
          <Typography variant='caption' sx={{ lineBreak: 'anywhere', whiteSpace: 'pre-wrap' }} textAlign='right'>
            {message.usage}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

export const AssistantMessage = React.memo(({ message }: AssistantMessageProps) => {
  return <LastAssistantMessage message={message} />;
});
